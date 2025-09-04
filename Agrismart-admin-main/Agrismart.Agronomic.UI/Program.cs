using Agrismart.Agronomic.UI;
using Agrismart.Agronomic.UI.Authentication;
using Agrismart.Agronomic.UI.Configuration;
using Agrismart.Agronomic.UI.Services;
using Agrismart.Agronomic.UI.Services.Interfaces;
using Microsoft.AspNetCore.Components.Authorization;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.WebAssembly.Hosting;
 
var builder = WebAssemblyHostBuilder.CreateDefault(args);
builder.RootComponents.Add<App>("#app");
builder.RootComponents.Add<HeadOutlet>("head::after");

builder.Services.Configure<AgriSmartApiConfiguration>(builder.Configuration.GetSection("AgriSmartApiConfiguration"));

builder.Services.AddHttpClient();
builder.Services.AddSingleton<AuthenticationDataMemoryStorage>();
builder.Services.AddSingleton<IAuthenticationService, AuthenticationService>();
builder.Services.AddSingleton<IClientService, ClientService>();
builder.Services.AddSingleton<ILicenseService, LicenseService>();
builder.Services.AddSingleton<ICompanyService, CompanyService>();
builder.Services.AddSingleton<IFarmService, FarmService>();
builder.Services.AddSingleton<IProductionUnitService, ProductionUnitService>();
builder.Services.AddSingleton<IProductionUnitTypeService, ProductionUnitTypeService>();
builder.Services.AddSingleton<ICropProductionService, CropProductionService>();
builder.Services.AddSingleton<ICropService, CropService>();
builder.Services.AddSingleton<IDeviceService, DeviceService>();
builder.Services.AddSingleton<IContainerService, ContainerService>();
builder.Services.AddSingleton<IGrowingMediumService, GrowingMediumService>();
builder.Services.AddSingleton<ICropProductionIrrigationSectorService, CropProductionIrrigationSectorService>();
builder.Services.AddSingleton<ICropProductionDeviceService, CropProductionDeviceService>();
builder.Services.AddSingleton<ISensorService, SensorService>();
builder.Services.AddSingleton<IDropperService, DropperService>();
builder.Services.AddSingleton<ICatalogService, CatalogService>();
builder.Services.AddSingleton<IContainerService, ContainerService>();
builder.Services.AddSingleton<ICropPhaseService, CropPhaseService>();
builder.Services.AddSingleton<IUserService, UserService>();
builder.Services.AddSingleton<IUserStatusService, UserStatusService>();
builder.Services.AddSingleton<IProfileService, ProfileService>();
builder.Services.AddSingleton<IUserFarmService, UserFarmService>();
builder.Services.AddSingleton<IFertilizerService, FertilizerService>();
builder.Services.AddSingleton<IWaterService, WaterService>();
builder.Services.AddSingleton<IFertilizerChemistryService, FertilizerChemistryService>();
builder.Services.AddSingleton<IWaterChemistryService, WaterChemistryService>();
builder.Services.AddSingleton<ICropPhaseOptimalService, CropPhaseOptimalService>();
builder.Services.AddSingleton<ICalculationSettingService, CalculationSettingService>();
builder.Services.AddSingleton<IRelayModuleService, RelayModuleService>();
builder.Services.AddSingleton<IMeasurementVariableService, MeasurementVariableService>();
builder.Services.AddSingleton<ITimeZoneService, TimeZoneService>();
builder.Services.AddSingleton<IContainerTypeService, ContainerTypeService>();
builder.Services.AddSingleton<IMeasurementVariableStandardService, MeasurementVariableStandardService>();
builder.Services.AddSingleton<IMeasurementUnitService, MeasurementUnitService>();
builder.Services.AddScoped<AgrismartAuthenticationStateProvider>();
builder.Services.AddScoped<AuthenticationStateProvider>(sp => sp.GetRequiredService<AgrismartAuthenticationStateProvider>());
builder.Services.AddAuthorizationCore();

builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) });

await builder.Build().RunAsync();
