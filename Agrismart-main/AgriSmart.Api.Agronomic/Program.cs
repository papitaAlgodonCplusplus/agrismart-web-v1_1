using AgriSmart.Application.Logging;
using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Configuration;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Infrastructure.Repositories.Query;
using AgriSmart.Application.Agronomic.Handlers.Queries;
using AgriSmart.Application.Agronomic.Handlers.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Infrastructure.Repositories.Command;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Entities;
using AgriSmart.Calculator.Interfaces;
using AgriSmart.Calculator.Logic;
using AgriSmart.Infrastructure.Mappings; // Commented out due to build issues
using AgriSmart.Application.Agronomic.Commands;

var builder = WebApplication.CreateBuilder(args);

// Register Calculator Services
builder.Services.AddScoped<IIrrigationDesignCalculator, IrrigationDesignCalculator>();

// Register AutoMapper Profile
builder.Services.AddAutoMapper(typeof(IrrigationDesignMappingProfile)); // Commented out due to build issues

// If you haven't added MediatR yet, add it:
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(CreateIrrigationDesignCommand).Assembly));

// Add services to the container.

builder.Services.AddControllers();

builder.Services.Configure<AgriSmartDbConfiguration>(builder.Configuration.GetSection("AgriSmartDbConfiguration"));
builder.Services.Configure<FileLoggingConfiguration>(builder.Configuration.GetSection("FileLoggingConfiguration"));
builder.Services.Configure<JWTConfiguration>(builder.Configuration.GetSection("JWTConfiguration"));

builder.Services.AddDbContext<AgriSmartContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetSection("AgriSmartDbConfiguration").GetSection("ConnectionString").Value);
});

//ILogger to file
builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<ILoggerProvider, FileLoggerProvider>());
LoggerProviderOptions.RegisterProviderOptions<FileLoggingConfiguration, FileLoggerProvider>(builder.Services);

builder.Services.AddAutoMapper(typeof(Program));
//Command Handlers
builder.Services.AddMediatR(cfg => {
    cfg.RegisterServicesFromAssembly(typeof(GetAllCatalogsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllClientsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetClientByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllLicensesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateLicenseHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateLicenseHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllProductionUnitsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllCompaniesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllFarmsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllCropProductionsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetCropProductionByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllCropProductionIrrigationSectorsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllDevicesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(ProcessDeviceRawDataMeasurementsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllFertilizersHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllFertilizerChemistriesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllFertilizerInputsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllDroppersHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateFertilizerHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetFertilizerByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetFertilizerInputByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetFarmByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetCatalogByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllUsersHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetProductionUnitByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateFarmHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateFarmHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateDeviceHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateDeviceHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateCropProductionIrrigationSectorHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateCropProductionIrrigationSectorHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(LoginHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllProductionUnitTypesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllCropsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllContainersHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllContainerTypesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllGrowingMediumsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateCropProductionHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateCropProductionHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateCropProductionDeviceHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateDropperHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateDropperHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateContainerHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateContainerHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateGrowingMediumHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateGrowingMediumHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateClientHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateClientHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateCompanyHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateCompanyHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateFertilizerInputHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateFertilizerInputHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateFertilizerChemistryHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateFertilizerChemistryHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateCatalogHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateCatalogHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateUserHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateUserHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllUserStatusesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllProfilesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllUserFarmsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateUserFarmHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteUserFarmHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateWaterHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateWaterHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllWatersHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetWaterByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllCropPhaseOptimalsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllCropProductionDevicesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllWaterChemistriesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetCropPhaseSolutionRequirementByIdPhaseHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllMeasurementUnitsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllInputPresentationsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetInputPresentationByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateInputPresentationHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateInputPresentationHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllIrrigationEventsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllIrrigationMeasurementsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllMeasurementsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllMeasurementKPIsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetLatestMeasurementKPIsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllMeasurementVariablesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetMeasurementVariableByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateMeasurementVariableHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateMeasurementVariableHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllMeasurementVariableStandardsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllGraphsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetGraphByIdHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateGraphHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateGraphHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllAnalyticalEntitiesHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAnalyticalEntityByIdQuery).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateAnalyticalEntityHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UpdateAnaliticalEntityHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllIrrigationRequestsHandler ).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetAllMeasurementsBaseHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(ProcessCropProductionRawDataMeasurementsHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateIrrigationEventHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(CreateIrrigationEngineeringDesignCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(GetIrrigationEngineeringDesignsQueryHandler).Assembly);
    // DELETE Command Handlers
    cfg.RegisterServicesFromAssembly(typeof(DeleteAnalyticalEntityCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteCalculationSettingCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteCatalogCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteContainerCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteCropPhaseCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteCropPhaseOptimalCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteCropProductionCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteCropProductionIrrigationSectorCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteDropperCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteFertilizerCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteFertilizerChemistryCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteFertilizerInputCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteGrowingMediumCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteIrrigationEventCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteLicenseCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteMeasurementVariableCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteRelayModuleCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteSensorCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteWaterChemistryCommandHandler).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(DeleteWaterCommandHandler).Assembly);
});

//Repositories
builder.Services.AddScoped(typeof(IBaseQueryRepository<>), typeof(BaseQueryRepository<>));
builder.Services.AddTransient<IClientQueryRepository, ClientQueryRepository>();
builder.Services.AddTransient<ILicenseQueryRepository, LicenseQueryRepository>();
builder.Services.AddTransient<ILicenseCommandRepository, LicenseCommandRepository>();
builder.Services.AddTransient<ICompanyQueryRepository, CompanyQueryRepository>();
builder.Services.AddTransient<IFarmQueryRepository, FarmQueryRepository>();
builder.Services.AddTransient<IUserFarmCommandRepository, UserFarmCommandRepository>();
builder.Services.AddTransient<IProductionUnitQueryRepository, ProductionUnitQueryRepository>();
builder.Services.AddTransient<ICropProductionQueryRepository, CropProductionQueryRepository>();
builder.Services.AddTransient<ICropProductionIrrigationSectorQueryRepository, CropProductionIrrigationSectorQueryRepository>();
builder.Services.AddTransient<IDeviceQueryRepository, DeviceQueryRepository>();
builder.Services.AddTransient<IDeviceCommandRepository, DeviceCommandRepository>();
builder.Services.AddTransient<IDeviceRawDataCommandRepository, DeviceRawDataCommandRepository>();
builder.Services.AddTransient<IFertilizerQueryRepository, FertilizerQueryRepository>();
builder.Services.AddTransient<IFertilizerChemistryQueryRepository, FertilizerChemistryQueryRepository>();
builder.Services.AddTransient<IFertilizerInputQueryRepository, FertilizerInputQueryRepository>();
builder.Services.AddTransient<IFertilizerInputCommandRepository, FertilizerInputCommandRepository>();
builder.Services.AddTransient<IFertilizerChemistryCommandRepository, FertilizerChemistryCommandRepository>();
builder.Services.AddTransient<IFertilizerCommandRepository, FertilizerCommandRepository>();
builder.Services.AddTransient<IClientCommandRepository, ClientCommandRepository>();
builder.Services.AddTransient<ICompanyCommandRepository, CompanyCommandRepository>();
builder.Services.AddTransient<IFarmCommandRepository, FarmCommandRepository>();
builder.Services.AddTransient<IUserQueryRepository, UserQueryRepository>();
builder.Services.AddTransient<IProductionUnitQueryRepository, ProductionUnitQueryRepository>();
builder.Services.AddTransient<IProductionUnitCommandRepository, ProductionUnitCommandRepository>();
builder.Services.AddTransient<ICropProductionCommandRepository, CropProductionCommandRepository>();
builder.Services.AddTransient<ICropProductionDeviceCommandRepository, CropProductionDeviceCommandRepository>();
builder.Services.AddTransient<ICropProductionIrrigationSectorCommandRepository, CropProductionIrrigationSectorCommandRepository>();
builder.Services.AddTransient<IProductionUnitTypeQueryRepository, ProductionUnitTypeQueryRepository>();
builder.Services.AddTransient<ICropQueryRepository, CropQueryRepository>();
builder.Services.AddTransient<ICropCommandRepository, CropCommandRepository>();
builder.Services.AddTransient<IContainerQueryRepository, ContainerQueryRepository>();
builder.Services.AddTransient<IContainerTypeQueryRepository, ContainerTypeQueryRepository>();
builder.Services.AddTransient<IGrowingMediumQueryRepository, GrowingMediumQueryRepository>();
builder.Services.AddTransient<ISensorQueryRepository, SensorQueryRepository>();
builder.Services.AddTransient<ISensorCommandRepository, SensorCommandRepository>();
builder.Services.AddTransient<IDropperCommandRepository, DropperCommandRepository>();
builder.Services.AddTransient<IDropperQueryRepository, DropperQueryRepository>();
builder.Services.AddTransient<IContainerCommandRepository, ContainerCommandRepository>();
builder.Services.AddTransient<ICatalogQueryRepository, CatalogQueryRepository>();
builder.Services.AddTransient<IGrowingMediumCommandRepository, GrowingMediumCommandRepository>();
builder.Services.AddTransient<ICropPhaseCommandRepository, CropPhaseCommandRepository>();
builder.Services.AddTransient<ICropPhaseQueryRepository, CropPhaseQueryRepository>();
builder.Services.AddTransient<ICatalogCommandRepository, CatalogCommandRepository>();
builder.Services.AddTransient<IUserCommandRepository, UserCommandRepository>();
builder.Services.AddTransient<IUserStatusQueryRepository, UserStatusQueryRepository>();
builder.Services.AddTransient<IProfileQueryRepository, ProfileQueryRepository>();
builder.Services.AddTransient<IUserFarmQueryRepository, UserFarmQueryRepository>();
builder.Services.AddTransient<IUserFarmCommandRepository, UserFarmCommandRepository>();
builder.Services.AddTransient<IWaterQueryRepository, WaterQueryRepository>();
builder.Services.AddTransient<IWaterCommandRepository, WaterCommandRepository>();
builder.Services.AddTransient<ICropPhaseOptimalCommandRepository, CropPhaseOptimalCommandRepository>();
builder.Services.AddTransient<ICropPhaseOptimalQueryRepository, CropPhaseOptimalQueryRepository>();
builder.Services.AddTransient<ICalculationSettingCommandRepository, CalculationSettingCommandRepository>();
builder.Services.AddTransient<ICalculationSettingQueryRepository, CalculationSettingQueryRepository>();
builder.Services.AddTransient<IRelayModuleCommandRepository, RelayModuleCommandRepository>();
builder.Services.AddTransient<IRelayModuleQueryRepository, RelayModuleQueryRepository>();
builder.Services.AddTransient<IRelayModuleCropProductionIrrigationSectorCommandRepository, RelayModuleCropProductionIrrigationSectorCommandRepository>();
builder.Services.AddTransient<IRelayModuleCropProductionIrrigationSectorQueryRepository, RelayModuleCropProductionIrrigationSectorQueryRepository>();
builder.Services.AddTransient<ICropProductionDeviceQueryRepository, CropProductionDeviceQueryRepository>();
builder.Services.AddTransient<IWaterChemistryQueryRepository, WaterChemistryQueryRepository>();
builder.Services.AddTransient<IWaterChemistryCommandRepository, WaterChemistryCommandRepository>();
builder.Services.AddTransient<ICropPhaseSolutionRequirementQueryRepository, CropPhaseSolutionRequirementQueryRepository>();
builder.Services.AddTransient<IMeasurementUnitQueryRepository, MeasurementUnitQueryRepository>();
builder.Services.AddTransient<IInputPresentationQueryRepository, InputPresentationQueryRepository>();
builder.Services.AddTransient<IInputPresentationCommandRepository, InputPresentationCommandRepository>();
builder.Services.AddTransient<IIrrigationMeasurementQueryRepository, IrrigationMeasurementQueryRepository>();
builder.Services.AddTransient<IMeasurementQueryRepository, MeasurementQueryRepository>();
builder.Services.AddTransient<IMeasurementVariableQueryRepository, MeasurementVariablesQueryRepository>();
builder.Services.AddTransient<IMeasurementVariableCommandRepository, MeasurementVariableCommandRepository>();
builder.Services.AddTransient<IMeasurementVariableStandardQueryRepository, MeasurementVariablesStandardQueryRepository>();
builder.Services.AddTransient<IMeasurementKPIQueryRepository, MeasurementKPIQueryRepository>();
builder.Services.AddTransient<IGraphQueryRepository, GraphQueryRepository>();
builder.Services.AddTransient<IGraphCommandRepository, GraphCommandRepository>();
builder.Services.AddTransient<IAnalyticalEntityQueryRepository, AnalyticalEntityQueryRepository>();
builder.Services.AddTransient<IAnalyticalEntityCommandRepository, AnalyticalEntityCommandRepository>();
builder.Services.AddTransient<IIrrigationEventQueryRepository, IrrigationEventQueryRepository>();
builder.Services.AddTransient<IIrrigationMeasurementQueryRepository, IrrigationMeasurementQueryRepository>();
builder.Services.AddTransient<ITimeZoneQueryRepository, TimeZoneQueryRepository>();
builder.Services.AddTransient<IIrrigationRequestsQueryRepository, IrrigationRequestsQueryRepository>();
builder.Services.AddTransient<IMeasurementBaseQueryRepository, MeasurementBaseQueryRepository>();
builder.Services.AddTransient<ICropProductionRawDataCommandRepository, CropProductionRawDataCommandRepository>();
builder.Services.AddTransient<IIrrigationEventCommandRepository, IrrigationEventCommandRepository>();
builder.Services.AddScoped<IrrigationDesignCalculator>();
builder.Services.AddScoped<HydraulicCalculationEngine>();
builder.Services.AddScoped<ValidationEngine>();
builder.Services.AddScoped<OptimizationEngine>();
builder.Services.AddScoped<EconomicAnalysisEngine>();
builder.Services.AddAutoMapper(typeof(IrrigationDesignMappingProfile)); // Commented out due to build issues
builder.Services.AddAutoMapper(typeof(AgriSmart.Application.Agronomic.Mappings.IrrigationEngineeringDesignProfile));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})

// Adding Jwt Bearer
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters()
    {
        ValidateAudience = true,
        ValidAudience = builder.Configuration.GetSection("JWTConfiguration").GetSection("ValidAudience").Value,
        ValidIssuer = builder.Configuration.GetSection("JWTConfiguration").GetSection("ValidIssuer").Value,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration.GetSection("JWTConfiguration").GetSection("Secret").Value))
    };
});


// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => {
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "JWTToken_Auth_API",
        Version = "v1"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. \r\n\r\n Enter 'Bearer' [space] and then your token in the text input below.\r\n\r\nExample: \"Bearer 1safsfsdfdfd\"",
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference {
                    Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});

builder.Services.AddHttpContextAccessor();



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment() || true)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

// Authentication & Authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
