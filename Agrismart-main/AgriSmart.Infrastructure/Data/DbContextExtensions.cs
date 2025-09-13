
// Agrismart-main/AgriSmart.Infrastructure/Data/DbContextExtensions.cs
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Infrastructure.Data
{
    public static class DbContextExtensions
    {
        public static void ConfigureIrrigationDesignEntities(this ModelBuilder modelBuilder)
        {
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
