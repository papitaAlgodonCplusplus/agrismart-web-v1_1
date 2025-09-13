using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using TimeZone = AgriSmart.Core.Entities.TimeZone;

namespace AgriSmart.Infrastructure.Data
{
    public class AgriSmartContext : DbContext
    {
        public AgriSmartContext(DbContextOptions<AgriSmartContext> options) : base(options) { }
        public DbSet<Client> Client { get; set; }
        public DbSet<License> License { get; set; }
        public DbSet<Company> Company { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<Profile> Profile { get; set; }
        public DbSet<UserFarm> UserFarm { get; set; }
        public DbSet<UserStatus> UserStatus { get; set; }
        public DbSet<Farm> Farm { get; set; }
        public DbSet<ProductionUnitType> ProductionUnitType { get; set; }
        public DbSet<ProductionUnit> ProductionUnit { get; set; }
        public DbSet<Crop> Crop { get; set; }
        public DbSet<Container> Container { get; set; }
        public DbSet<ContainerType> ContainerType { get; set; }
        public DbSet<GrowingMedium> GrowingMedium { get; set; }
        public DbSet<CropProduction> CropProduction { get; set; }
        public DbSet<CropProductionIrrigationSector> CropProductionIrrigationSector { get; set; }
        public DbSet<CropProductionDevice> CropProductionDevice { get; set; }
        public DbSet<Device> Device { get; set; }
        public DbSet<Sensor> Sensor { get; set; }
        public DbSet<DeviceRawData> DeviceRawData { get; set; }
        public DbSet<Fertilizer> Fertilizer { get; set; }
        public DbSet<FertilizerChemistry> FertilizerChemistry { get; set; }
        public DbSet<FertilizerInput> FertilizerInput { get; set; }
        public DbSet<Dropper> Dropper { get; set; }
        public DbSet<Catalog> Catalog { get; set; }
        public DbSet<CropPhase> CropPhase { get; set; }
        public DbSet<Water> Water { get; set; }
        public DbSet<WaterChemistry> WaterChemistry { get; set; }
        public DbSet<CropPhaseOptimal> CropPhaseOptimal { get; set; }
        public DbSet<CalculationSetting> CalculationSetting { get; set; }
        public DbSet<RelayModule> RelayModule { get; set; }
        public DbSet<RelayModuleCropProductionIrrigationSector> RelayModuleCropProductionIrrigationSector { get; set; }
        public DbSet<CropPhaseSolutionRequirement> CropPhaseSolutionRequirement { get; set; }
        public DbSet<MeasurementUnit> MeasurementUnit { get; set; }
        public DbSet<InputPresentation> InputPresentation { get; set; }
        public DbSet<IrrigationEvent> IrrigationEvent { get; set; }
        public DbSet<IrrigationMeasurement> IrrigationMeasurement { get; set; }
        public DbSet<MeasurementVariable> MeasurementVariable { get; set; }
        public DbSet<MeasurementVariableStandard> MeasurementVariableStandard { get; set; }
        public DbSet<Measurement> Measurement { get; set; }
        public DbSet<MeasurementKPI> MeasurementKPI { get; set; }
        public DbSet<Graph> Graph { get; set; }
        public DbSet<AnalyticalEntity> AnaliticalEntity { get; set; }
        public DbSet<TimeZone> TimeZone { get; set; }
        public DbSet<IrrigationRequest> CropProductionIrrigationRequest { get; set; }
        public DbSet<MeasurementBase> MeasurementBase { get; set; }
        public DbSet<IrrigationDesign> IrrigationDesigns { get; set; }
        public DbSet<IrrigationTemplate> IrrigationTemplates { get; set; }

    }
}