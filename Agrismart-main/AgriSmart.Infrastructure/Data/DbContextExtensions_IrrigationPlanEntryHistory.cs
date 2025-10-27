
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Infrastructure.Data
{
    public static partial class DbContextExtensions
    {
        public static void ConfigureIrrigationPlanEntryHistory(this ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<IrrigationPlanEntryHistory>(entity =>
            {
                entity.HasKey(e => e.Id);

                // Basic Properties
                entity.Property(e => e.IrrigationPlanEntryId)
                    .IsRequired();

                entity.Property(e => e.IrrigationPlanId)
                    .IsRequired();

                entity.Property(e => e.IrrigationModeId)
                    .IsRequired();

                entity.Property(e => e.ExecutionStartTime)
                    .IsRequired()
                    .HasColumnType("datetime2");

                entity.Property(e => e.ExecutionEndTime)
                    .HasColumnType("datetime2");

                entity.Property(e => e.PlannedDuration)
                    .IsRequired();

                entity.Property(e => e.ActualDuration);

                entity.Property(e => e.ExecutionStatus)
                    .IsRequired()
                    .HasMaxLength(50)
                    .HasDefaultValue("Scheduled");

                entity.Property(e => e.Sequence);

                entity.Property(e => e.Notes)
                    .HasMaxLength(1000);

                entity.Property(e => e.ErrorMessage)
                    .HasMaxLength(2000);

                entity.Property(e => e.IsManualExecution)
                    .IsRequired()
                    .HasDefaultValue(true);

                // Decimal Properties with Precision
                entity.Property(e => e.WaterVolumeDelivered)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.FlowRate)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.Pressure)
                    .HasColumnType("decimal(18,4)");

                entity.Property(e => e.Temperature)
                    .HasColumnType("decimal(18,2)");

                entity.Property(e => e.DeviceId)
                    .HasMaxLength(100);

                // Audit Fields
                entity.Property(e => e.DateCreated)
                    .IsRequired()
                    .HasDefaultValueSql("GETUTCDATE()")
                    .HasColumnType("datetime2");

                entity.Property(e => e.DateUpdated)
                    .HasColumnType("datetime2");

                entity.Property(e => e.CreatedBy)
                    .IsRequired();

                entity.Property(e => e.UpdatedBy);

                // Indexes for performance
                entity.HasIndex(e => e.IrrigationPlanEntryId)
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_IrrigationPlanEntryId");

                entity.HasIndex(e => e.IrrigationPlanId)
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_IrrigationPlanId");

                entity.HasIndex(e => e.IrrigationModeId)
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_IrrigationModeId");

                entity.HasIndex(e => e.ExecutionStartTime)
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_ExecutionStartTime");

                entity.HasIndex(e => e.ExecutionStatus)
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_ExecutionStatus");

                entity.HasIndex(e => new { e.IrrigationPlanId, e.ExecutionStartTime })
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_PlanId_StartTime");

                entity.HasIndex(e => new { e.ExecutionStatus, e.ExecutionStartTime })
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_Status_StartTime");

                entity.HasIndex(e => e.DeviceId)
                    .HasDatabaseName("IX_IrrigationPlanEntryHistory_DeviceId");

                // Foreign Key Relationships
                entity.HasOne(e => e.IrrigationPlanEntry)
                    .WithMany()
                    .HasForeignKey(e => e.IrrigationPlanEntryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.IrrigationPlan)
                    .WithMany()
                    .HasForeignKey(e => e.IrrigationPlanId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.IrrigationMode)
                    .WithMany()
                    .HasForeignKey(e => e.IrrigationModeId)
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
        }
    }
}