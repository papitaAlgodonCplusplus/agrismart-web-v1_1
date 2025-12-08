using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Infrastructure.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using System;
using System.Threading.Tasks;
using System.Data;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class SoilAnalysisCommandRepository : BaseCommandRepository<SoilAnalysis>, ISoilAnalysisCommandRepository
    {
        public SoilAnalysisCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor)
            : base(context, httpContextAccessor)
        {
        }

        public async Task<SoilAnalysis> CreateWithCalculationsAsync(SoilAnalysis soilAnalysis)
        {
            // Auto-calculate ratios if data available
            CalculateRatios(soilAnalysis);

            // Set audit fields
            soilAnalysis.DateCreated = DateTime.Now;
            soilAnalysis.CreatedBy = GetSessionUserId();
            soilAnalysis.Active = true;

            await _context.Set<SoilAnalysis>().AddAsync(soilAnalysis);
            await _context.SaveChangesAsync();

            return soilAnalysis;
        }

        public async Task<SoilAnalysis> UpdateWithCalculationsAsync(SoilAnalysis soilAnalysis)
        {
            var existing = await _context.Set<SoilAnalysis>().FindAsync(soilAnalysis.Id);
            if (existing == null)
            {
                throw new KeyNotFoundException($"SoilAnalysis with Id {soilAnalysis.Id} not found");
            }

            // Update properties
            _context.Entry(existing).CurrentValues.SetValues(soilAnalysis);

            // Recalculate ratios
            CalculateRatios(existing);

            // Update audit fields
            existing.DateUpdated = DateTime.Now;
            existing.UpdatedBy = GetSessionUserId();

            await _context.SaveChangesAsync();

            return existing;
        }

        public async Task<bool> SoftDeleteAsync(int id)
        {
            var soilAnalysis = await _context.Set<SoilAnalysis>().FindAsync(id);
            if (soilAnalysis == null)
            {
                return false;
            }

            // Hard delete - physically remove from database
            _context.Set<SoilAnalysis>().Remove(soilAnalysis);
            await _context.SaveChangesAsync();

            return true;
        }

        // Private helper methods
        private void CalculateRatios(SoilAnalysis sa)
        {
            // Ca:Mg ratio
            if (sa.Calcium.HasValue && sa.Magnesium.HasValue && sa.Magnesium.Value > 0)
            {
                sa.CaToMgRatio = sa.Calcium.Value / sa.Magnesium.Value;
            }

            // Mg:K ratio
            if (sa.Magnesium.HasValue && sa.Potassium.HasValue && sa.Potassium.Value > 0)
            {
                sa.MgToKRatio = sa.Magnesium.Value / sa.Potassium.Value;
            }

            // Base saturation percentages calculation is disabled
            // Note: This calculation requires nutrient values to be in meq/100g, not ppm
            // If values are provided in ppm, they must be converted first:
            // Ca (meq/100g) = Ca (ppm) / 200
            // Mg (meq/100g) = Mg (ppm) / 120
            // K (meq/100g) = K (ppm) / 390
            // Na (meq/100g) = Na (ppm) / 230
            //
            // Base saturation % = (cation meq/100g / CEC) * 100
            //
            // These calculations should be done in the application layer or frontend
            // where units are explicitly known, not here in the repository.
        }
    }
}
