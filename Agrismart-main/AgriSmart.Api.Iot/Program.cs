using AgriSmart.Application.Iot.Handlers;
using AgriSmart.Application.Iot.Services;
using AgriSmart.Application.Logging;
using AgriSmart.Core.Configuration;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Infrastructure.Repositories.Command;
using AgriSmart.Infrastructure.Repositories.Query;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Configuration;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Configuration
builder.Services.Configure<AgriSmartDbConfiguration>(builder.Configuration.GetSection("AgriSmartDbConfiguration"));
builder.Services.Configure<FileLoggingConfiguration>(builder.Configuration.GetSection("FileLoggingConfiguration"));

// Enhanced DbContext configuration with connection pooling and retry logic
var connectionString = builder.Configuration.GetSection("AgriSmartDbConfiguration").GetSection("ConnectionString").Value;

builder.Services.AddDbContextPool<AgriSmartContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        // Configure SQL Server specific options
        sqlOptions.CommandTimeout(300); // 5 minutes timeout for commands
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(30),
            errorNumbersToAdd: null
        );
        sqlOptions.MigrationsAssembly("AgriSmart.Infrastructure"); // If migrations are in Infrastructure project
    })
    .EnableSensitiveDataLogging(builder.Environment.IsDevelopment()) // Only in development
    .EnableServiceProviderCaching(true)
    .EnableDetailedErrors(builder.Environment.IsDevelopment()); // Only in development for performance
}, poolSize: 128); // Connection pool size at application level

// Add DbContextFactory for background services and long-running operations
builder.Services.AddDbContextFactory<AgriSmartContext>(options =>
{
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.CommandTimeout(300);
        sqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(30), null);
    });
});

builder.Services.AddMemoryCache();

// Health Checks
builder.Services.AddHealthChecks()
    .AddSqlServer(connectionString, name: "database", failureStatus: HealthStatus.Unhealthy, tags: new[] { "ready", "live" });

//ILogger to file
builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<ILoggerProvider, FileLoggerProvider>());
LoggerProviderOptions.RegisterProviderOptions<FileLoggingConfiguration, FileLoggerProvider>(builder.Services);

//Command Handlers with MediatR
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(AuthenticateDeviceHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AddDeviceRawDataHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AddMqttDeviceRawDataHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(ProcessDeviceRawDataHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeviceSensorCacheRefreshHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeviceSensorCacheRepository).Assembly);
});

// Services
builder.Services.AddScoped<DeviceSensorCacheService>();
builder.Services.AddScoped<IDeviceRawDataQueryRepository, DeviceRawDataQueryRepository>();
builder.Services.AddSingleton<IHostedService, DeviceSensorCacheRefreshHandler>();

// Repositories
builder.Services.AddTransient<IClientQueryRepository, ClientQueryRepository>();
builder.Services.AddTransient<ILicenseQueryRepository, LicenseQueryRepository>();
builder.Services.AddTransient<ILicenseCommandRepository, LicenseCommandRepository>();
builder.Services.AddTransient<ICompanyQueryRepository, CompanyQueryRepository>();
builder.Services.AddTransient<IDeviceQueryRepository, DeviceQueryRepository>();
builder.Services.AddTransient<IDeviceCommandRepository, DeviceCommandRepository>();
builder.Services.AddTransient<IDeviceRawDataCommandRepository, DeviceRawDataCommandRepository>();
builder.Services.AddTransient<ISensorQueryRepository, SensorQueryRepository>();
builder.Services.AddTransient<IDeviceSensorQueryRepository, DeviceSensorCacheRepository>();

// OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() 
    { 
        Title = "AgriSmart IoT API", 
        Version = "v1",
        Description = "AgriSmart IoT device management and data collection API"
    });
});

// CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://agrismart-web-v1-1-6yb7.onrender.com")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Add if you need credentials
    });
});

builder.Services.AddHttpContextAccessor();

// Add response compression for better performance
builder.Services.AddResponseCompression();

var app = builder.Build();

// Connection Pool Monitoring Middleware
app.Use(async (context, next) =>
{
    var stopwatch = Stopwatch.StartNew();
    var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
    
    try
    {
        await next(context);
    }
    catch (InvalidOperationException ex) when (ex.Message.Contains("timeout expired") || ex.Message.Contains("connection pool"))
    {
        logger.LogError(ex, "Database connection pool issue after {Duration}ms for {Path}", 
            stopwatch.ElapsedMilliseconds, context.Request.Path);
        
        context.Response.StatusCode = 503; // Service Unavailable
        context.Response.ContentType = "application/json";
        await context.Response.WriteAsync(@"{""error"": ""Database connection pool exhausted. Please try again later.""}");
        return;
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Unhandled exception after {Duration}ms for {Path}", 
            stopwatch.ElapsedMilliseconds, context.Request.Path);
        throw;
    }
    finally
    {
        // Log slow requests (over 5 seconds)
        if (stopwatch.ElapsedMilliseconds > 5000)
        {
            logger.LogWarning("Slow request completed in {Duration}ms: {Method} {Path}", 
                stopwatch.ElapsedMilliseconds, context.Request.Method, context.Request.Path);
        }
    }
});

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "AgriSmart IoT API v1");
        c.RoutePrefix = "swagger";
    });
}

// Health checks endpoints
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = async (context, report) =>
    {
        context.Response.ContentType = "application/json";
        var response = new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(x => new
            {
                name = x.Key,
                status = x.Value.Status.ToString(),
                exception = x.Value.Exception?.Message,
                duration = x.Value.Duration.ToString()
            })
        };
        await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(response));
    }
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

// Use response compression
app.UseResponseCompression();

// Use CORS middleware (must be before UseAuthentication and UseAuthorization)
app.UseCors("AllowAngularApp");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Log startup information
var logger = app.Services.GetRequiredService<ILogger<Program>>();
logger.LogInformation("AgriSmart IoT API started successfully");
logger.LogInformation("Environment: {Environment}", app.Environment.EnvironmentName);
logger.LogInformation("Connection String configured: {HasConnectionString}", !string.IsNullOrEmpty(connectionString));

app.Run();