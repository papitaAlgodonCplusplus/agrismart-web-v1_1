
// Agrismart-main/AgriSmart.Infrastructure/Data/DbContextExtensions.cs
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Infrastructure.Data
{
    public static partial class DbContextExtensions
    {
        public static void ConfigureIrrigationDesignEntities(this ModelBuilder modelBuilder)
        {

            // Configure IrrigationEngineeringDesign entity
            modelBuilder.Entity<IrrigationEngineeringDesign>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Basic Properties
                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.DesignType)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasDefaultValue("drip");

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasDefaultValue("draft");

                // Decimal Properties with Precision
                entity.Property(e => e.TotalArea)
                    .HasColumnType("decimal(18,4)")
                    .IsRequired();

                entity.Property(e => e.ContainerDensity)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.PlantDensity)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.DailyWaterRequirement)
                    .HasColumnType("decimal(18,6)");

                entity.Property(e => e.IrrigationFrequency)
                    .HasColumnType("decimal(18,4)");

                // Climate Parameters
                entity.Property(e => e.AverageTemperature)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.AverageHumidity)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.WindSpeed)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.SolarRadiation)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Elevation)
                    .HasColumnType("decimal(18,2)");

                // Water Source Parameters
                entity.Property(e => e.WaterSourceType)
                    .HasMaxLength(50)
                    .HasDefaultValue("well");

                entity.Property(e => e.WaterPressure)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.WaterFlowRate)
                    .HasColumnType("decimal(18,4)");

                // Water Quality Parameters
                entity.Property(e => e.WaterPh)
                    .HasColumnType("decimal(18,2)")
                    .HasDefaultValue(7.0m);

                entity.Property(e => e.ElectricalConductivity)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.TotalDissolvedSolids)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Nitrates)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Phosphorus)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Potassium)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Calcium)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Magnesium)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Sulfur)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Iron)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Manganese)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Zinc)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Copper)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.Boron)
                    .HasColumnType("decimal(18,2)");

                // Pipeline Configuration
                entity.Property(e => e.MainPipeDiameter)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.SecondaryPipeDiameter)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.LateralPipeDiameter)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.MainPipeMaterial)
                    .HasMaxLength(50)
                    .HasDefaultValue("PVC");

                entity.Property(e => e.SecondaryPipeMaterial)
                    .HasMaxLength(50)
                    .HasDefaultValue("PVC");

                entity.Property(e => e.LateralPipeMaterial)
                    .HasMaxLength(50)
                    .HasDefaultValue("PVC");

                entity.Property(e => e.MainPipeLength)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.SecondaryPipeLength)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.LateralPipeLength)
                    .HasColumnType("decimal(18,2)");

                // System Components
                entity.Property(e => e.HasFiltration)
                    .HasDefaultValue(false);

                entity.Property(e => e.HasAutomation)
                    .HasDefaultValue(false);

                entity.Property(e => e.HasFertigation)
                    .HasDefaultValue(false);

                entity.Property(e => e.HasFlowMeter)
                    .HasDefaultValue(false);

                entity.Property(e => e.HasPressureRegulator)
                    .HasDefaultValue(false);

                entity.Property(e => e.HasBackflowPrevention)
                    .HasDefaultValue(false);

                entity.Property(e => e.FiltrationSystemType)
                    .HasMaxLength(100);

                entity.Property(e => e.AutomationSystemType)
                    .HasMaxLength(100);

                entity.Property(e => e.FertigationSystemType)
                    .HasMaxLength(100);

                // Calculated Hydraulic Parameters
                entity.Property(e => e.TotalSystemFlowRate)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.SystemPressureLoss)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.RequiredPumpPower)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.PumpEfficiency)
                    .HasColumnType("decimal(18,4)")
                    .HasDefaultValue(75.0m);

                entity.Property(e => e.MaxFlowVelocity)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.UniformityCoefficient)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.EmitterFlowRate)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.WorkingPressure)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.EmitterSpacing)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.LateralSpacing)
                    .HasColumnType("decimal(18,2)");

                // Economic Analysis
                entity.Property(e => e.TotalMaterialCost)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.InstallationCost)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.MaintenanceCostPerYear)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.EnergyConsumptionPerYear)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.WaterConsumptionPerYear)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.TotalProjectCost)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.CostPerSquareMeter)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.PaybackPeriod)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.WaterSavingsPercentage)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.EnergySavingsPercentage)
                    .HasColumnType("decimal(18,2)");

                // Performance Metrics
                entity.Property(e => e.ApplicationEfficiency)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.DistributionUniformity)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.WaterUseEfficiency)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.SustainabilityScore)
                    .HasColumnType("decimal(18,2)");

                // Environmental Factors
                entity.Property(e => e.SoilWaterHoldingCapacity)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.SoilInfiltrationRate)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.SoilType)
                    .HasMaxLength(50)
                    .HasDefaultValue("loam");

                entity.Property(e => e.SlopePercentage)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.DrainageClass)
                    .HasMaxLength(50)
                    .HasDefaultValue("well");

                // Validation Results
                entity.Property(e => e.IsHydraulicallyValid)
                    .HasDefaultValue(false);

                entity.Property(e => e.IsEconomicallyViable)
                    .HasDefaultValue(false);

                entity.Property(e => e.IsEnvironmentallySound)
                    .HasDefaultValue(false);

                entity.Property(e => e.MeetsAgronomicRequirements)
                    .HasDefaultValue(false);

                entity.Property(e => e.ValidationNotes)
                    .HasMaxLength(2000);

                entity.Property(e => e.RecommendationsAndOptimizations)
                    .HasMaxLength(2000);

                // Complex JSON Data
                entity.Property(e => e.DetailedHydraulicCalculationsJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.ComponentSpecificationsJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.OperationScheduleJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.MaterialListJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.InstallationInstructionsJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.MaintenanceScheduleJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.TechnicalDrawingsJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.QualityControlChecklistJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.RiskAssessmentJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.ComplianceRequirementsJson)
                    .HasColumnType("nvarchar(max)");

                // Metadata
                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.UpdatedAt);

                entity.Property(e => e.ApprovedAt);

                entity.Property(e => e.Version)
                    .HasMaxLength(100)
                    .HasDefaultValue("1.0");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.Property(e => e.IsTemplate)
                    .HasDefaultValue(false);

                entity.Property(e => e.IsPublic)
                    .HasDefaultValue(false);

                entity.Property(e => e.Tags)
                    .HasMaxLength(1000);

                // Calculation Flags
                entity.Property(e => e.RequiresRecalculation)
                    .HasDefaultValue(true);

                entity.Property(e => e.LastCalculatedAt);

                entity.Property(e => e.CalculationInProgress)
                    .HasDefaultValue(false);

                entity.Property(e => e.CalculationErrors)
                    .HasMaxLength(2000);

                entity.Property(e => e.CalculationNotes)
                    .HasMaxLength(500);

                // Integration Properties
                entity.Property(e => e.ExternalSystemId)
                    .HasMaxLength(100);

                entity.Property(e => e.ExportedFilePaths)
                    .HasMaxLength(2000);

                entity.Property(e => e.LastExportedAt);

                entity.Property(e => e.ExportFormat)
                    .HasMaxLength(100);

                // Monitoring Properties
                entity.Property(e => e.MonitoringEnabled)
                    .HasDefaultValue(false);

                entity.Property(e => e.LastMonitoringCheck);

                entity.Property(e => e.AlertConditions)
                    .HasMaxLength(1000);

                entity.Property(e => e.NotificationSettings)
                    .HasMaxLength(1000);

                // Relationships
                entity.HasOne(e => e.Client)
                    .WithMany()
                    .HasForeignKey(e => e.ClientId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Farm)
                    .WithMany()
                    .HasForeignKey(e => e.FarmId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.CropProduction)
                    .WithMany()
                    .HasForeignKey(e => e.CropProductionId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Container)
                    .WithMany()
                    .HasForeignKey(e => e.ContainerId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Dropper)
                    .WithMany()
                    .HasForeignKey(e => e.DropperId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.GrowingMedium)
                    .WithMany()
                    .HasForeignKey(e => e.GrowingMediumId)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Creator)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Updater)
                    .WithMany()
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasOne(e => e.Approver)
                    .WithMany()
                    .HasForeignKey(e => e.ApprovedBy)
                    .OnDelete(DeleteBehavior.SetNull);

                // Indexes for Performance
                entity.HasIndex(e => e.ClientId)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_ClientId");

                entity.HasIndex(e => e.FarmId)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_FarmId");

                entity.HasIndex(e => e.CropProductionId)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_CropProductionId");

                entity.HasIndex(e => e.DesignType)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_DesignType");

                entity.HasIndex(e => e.Status)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_Status");

                entity.HasIndex(e => e.CreatedBy)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_CreatedBy");

                entity.HasIndex(e => e.CreatedAt)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_CreatedAt");

                entity.HasIndex(e => e.IsActive)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_IsActive");

                entity.HasIndex(e => e.IsTemplate)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_IsTemplate");

                entity.HasIndex(e => e.RequiresRecalculation)
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_RequiresRecalculation");

                // Composite Indexes for Common Queries
                entity.HasIndex(e => new { e.ClientId, e.IsActive, e.Status })
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_ClientId_IsActive_Status");

                entity.HasIndex(e => new { e.IsActive, e.IsTemplate, e.DesignType })
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_IsActive_IsTemplate_DesignType");

                entity.HasIndex(e => new { e.CreatedAt, e.IsActive })
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_CreatedAt_IsActive");

                entity.HasIndex(e => new { e.FarmId, e.IsActive })
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_FarmId_IsActive");

                entity.HasIndex(e => new { e.RequiresRecalculation, e.IsActive })
                    .HasDatabaseName("IX_IrrigationEngineeringDesigns_RequiresRecalculation_IsActive");
            });


            // Configure IrrigationDesign entity
            modelBuilder.Entity<IrrigationDesign>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.DesignType)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasDefaultValue("drip");

                entity.Property(e => e.Status)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasDefaultValue("draft");

                entity.Property(e => e.Version)
                    .IsRequired()
                    .HasMaxLength(20)
                    .HasDefaultValue("1.0");

                entity.Property(e => e.DesignParametersJson)
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.HydraulicParametersJson)
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.OptimizationParametersJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.CalculationResultsJson)
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.TagsJson)
                    .IsRequired()
                    .HasColumnType("nvarchar(max)")
                    .HasDefaultValue("[]");

                entity.Property(e => e.TemplateCategory)
                    .HasMaxLength(100);

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasDefaultValue(true);

                // Indexes
                entity.HasIndex(e => e.CropProductionId);
                entity.HasIndex(e => e.DesignType);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => e.IsTemplate);
                entity.HasIndex(e => e.CreatedBy);
                entity.HasIndex(e => e.Active);
                entity.HasIndex(e => new { e.Active, e.CreatedBy, e.Status });

                // Relationships
                entity.HasOne(e => e.CropProduction)
                    .WithMany()
                    .HasForeignKey(e => e.CropProductionId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Creator)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Updater)
                    .WithMany()
                    .HasForeignKey(e => e.UpdatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure IrrigationTemplate entity
            modelBuilder.Entity<IrrigationTemplate>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Description)
                    .HasMaxLength(1000);

                entity.Property(e => e.Category)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.DesignParametersJson)
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.HydraulicParametersJson)
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()");

                entity.Property(e => e.Active)
                    .IsRequired()
                    .HasDefaultValue(true);

                // Indexes
                entity.HasIndex(e => e.Category);
                entity.HasIndex(e => e.IsPublic);
                entity.HasIndex(e => e.CreatedBy);
                entity.HasIndex(e => e.Active);
                entity.HasIndex(e => new { e.Active, e.IsPublic, e.Category });

                // Relationships
                entity.HasOne(e => e.Creator)
                    .WithMany()
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);
            });


        }
    }
}
