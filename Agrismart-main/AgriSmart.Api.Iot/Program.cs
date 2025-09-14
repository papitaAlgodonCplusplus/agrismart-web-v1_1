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

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.Configure<AgriSmartDbConfiguration>(builder.Configuration.GetSection("AgriSmartDbConfiguration"));
builder.Services.Configure<FileLoggingConfiguration>(builder.Configuration.GetSection("FileLoggingConfiguration"));

builder.Services.AddDbContext<AgriSmartContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetSection("AgriSmartDbConfiguration").GetSection("ConnectionString").Value);
});

builder.Services.AddMemoryCache();

//ILogger to file
builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<ILoggerProvider, FileLoggerProvider>());
LoggerProviderOptions.RegisterProviderOptions<FileLoggingConfiguration, FileLoggerProvider>(builder.Services);

//Command Handlers
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(AuthenticateDeviceHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AddDeviceRawDataHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AddMqttDeviceRawDataHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(ProcessDeviceRawDataHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeviceSensorCacheRefreshHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeviceSensorCacheRepository).Assembly);
});

builder.Services.AddScoped<DeviceSensorCacheService>();
builder.Services.AddScoped<IDeviceRawDataQueryRepository, DeviceRawDataQueryRepository>();
builder.Services.AddSingleton<IHostedService, DeviceSensorCacheRefreshHandler>();

//Repositories
builder.Services.AddTransient<IClientQueryRepository, ClientQueryRepository>();
builder.Services.AddTransient<ILicenseQueryRepository, LicenseQueryRepository>();
builder.Services.AddTransient<ILicenseCommandRepository, LicenseCommandRepository>();
builder.Services.AddTransient<ICompanyQueryRepository, CompanyQueryRepository>();
builder.Services.AddTransient<IDeviceQueryRepository, DeviceQueryRepository>();
builder.Services.AddTransient<IDeviceCommandRepository, DeviceCommandRepository>();
builder.Services.AddTransient<IDeviceRawDataCommandRepository, DeviceRawDataCommandRepository>();
builder.Services.AddTransient<ISensorQueryRepository, SensorQueryRepository>();
builder.Services.AddTransient<IDeviceSensorQueryRepository, DeviceSensorCacheRepository>();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS configuration
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularApp", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "https://agrismart-web-v1-1-6yb7.onrender.com")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.Services.AddHttpContextAccessor();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Use CORS middleware (must be before UseAuthentication and UseAuthorization)
app.UseCors("AllowAngularApp");

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();