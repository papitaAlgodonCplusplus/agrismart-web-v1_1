using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using TimeZone = AgriSmart.Core.Entities.TimeZone;

namespace AgriSmart.Infrastructure.Data
{
    public class AgriSmartContext : DbContext
    {
        public AgriSmartContext(DbContextOptions<AgriSmartContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Catalog
            modelBuilder.Entity<Catalog>()
                .Property(e => e.Active)
                .HasDefaultValue(true);

            // Configure Crop
            modelBuilder.Entity<Crop>()
                .Property(e => e.CropBaseTemperature)
                .HasColumnType("decimal(18,2)");

            // Configure Farm decimal columns
            modelBuilder.Entity<Farm>()
                .Property(e => e.Area)
                .HasColumnType("decimal(18,2)");

            modelBuilder.Entity<Farm>()
                .Property(e => e.Latitude)
                .HasColumnType("decimal(18,6)");

            modelBuilder.Entity<Farm>()
                .Property(e => e.Longitude)
                .HasColumnType("decimal(18,6)");

            // Configure CropPhaseSolutionRequirement decimal columns
            var entity = modelBuilder.Entity<CropPhaseSolutionRequirement>();

            entity.Property(e => e.EC).HasColumnType("decimal(18,6)");
            entity.Property(e => e.HCO3).HasColumnType("decimal(18,6)");
            entity.Property(e => e.NO3).HasColumnType("decimal(18,6)");
            entity.Property(e => e.H2PO4).HasColumnType("decimal(18,6)");
            entity.Property(e => e.SO4).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Cl).HasColumnType("decimal(18,6)");
            entity.Property(e => e.NH4).HasColumnType("decimal(18,6)");
            entity.Property(e => e.K).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Ca).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Mg).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Na).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Fe).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Mn).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Zn).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Cu).HasColumnType("decimal(18,6)");
            entity.Property(e => e.B).HasColumnType("decimal(18,6)");
            entity.Property(e => e.Mo).HasColumnType("decimal(18,6)");
            entity.Property(e => e.pH).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Temperature).HasColumnType("decimal(18,2)");

            // Configure Active column with default value
            entity.Property(e => e.Active).HasDefaultValue(true);


            // Configure NutrientFormulationRecipe
            modelBuilder.Entity<NutrientFormulationRecipe>(entity =>
            {
                entity.ToTable("NutrientFormulationRecipe");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name).IsRequired().HasMaxLength(128);
                entity.Property(e => e.Description).HasMaxLength(512);
                entity.Property(e => e.RecipeType).HasMaxLength(32);
                entity.Property(e => e.Notes).HasMaxLength(512);

                entity.HasOne(e => e.Crop)
                    .WithMany()
                    .HasForeignKey(e => e.CropId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.CropPhase)
                    .WithMany()
                    .HasForeignKey(e => e.CropPhaseId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure NutrientFormulationRecipeFertilizer
            modelBuilder.Entity<NutrientFormulationRecipeFertilizer>(entity =>
            {
                entity.ToTable("NutrientFormulationRecipeFertilizer");
                entity.HasKey(e => e.Id);

                entity.HasOne(e => e.Recipe)
                    .WithMany(r => r.Fertilizers)
                    .HasForeignKey(e => e.RecipeId)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Fertilizer)
                    .WithMany()
                    .HasForeignKey(e => e.FertilizerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        
            modelBuilder.ConfigureIrrigationPlanEntryHistory();
        }
        public DbSet<IrrigationEngineeringDesign> IrrigationEngineeringDesigns { get; set; }

        public DbSet<Client> Client { get; set; }
        public DbSet<License> License { get; set; }
        public DbSet<Company> Company { get; set; }
        public DbSet<User> User { get; set; }
        public DbSet<Profile> Profile { get; set; }
        public DbSet<IrrigationPlan> IrrigationPlans { get; set; }
        public DbSet<IrrigationMode> IrrigationModes { get; set; }
        public DbSet<IrrigationPlanEntry> IrrigationPlanEntries { get; set; }
        public DbSet<IrrigationPlanEntryHistory> IrrigationPlanEntryHistory { get; set; }
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
        public DbSet<NutrientFormulationRecipe> NutrientFormulationRecipes { get; set; }
        public DbSet<NutrientFormulationRecipeFertilizer> NutrientFormulationRecipeFertilizers { get; set; }
        public DbSet<IrrigationPlanEntryHistory> IrrigationPlanEntryHistories { get; set; }

    }
}