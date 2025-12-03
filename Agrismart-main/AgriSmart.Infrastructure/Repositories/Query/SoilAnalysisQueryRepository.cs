using AgriSmart.Core.Configuration;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Queries;
using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class SoilAnalysisQueryRepository : BaseQueryRepository<SoilAnalysis>, ISoilAnalysisQueryRepository
    {
        public SoilAnalysisQueryRepository(
            IOptions<AgriSmartDbConfiguration> dbConfiguration,
            IHttpContextAccessor httpContextAccessor)
            : base(dbConfiguration, httpContextAccessor)
        {
        }

        public async Task<List<SoilAnalysis>> GetByCropProductionIdAsync(int cropProductionId, bool includeInactive = false)
        {
            using (var connection = CreateConnection())
            {
                var query = @"
                    SELECT * FROM SoilAnalysis
                    WHERE CropProductionId = @CropProductionId
                    " + (includeInactive ? "" : "AND Active = 1") + @"
                    ORDER BY SampleDate DESC";

                var result = await connection.QueryAsync<SoilAnalysis>(
                    query,
                    new { CropProductionId = cropProductionId }
                );

                return result.ToList();
            }
        }

        public async Task<SoilAnalysis> GetByIdAsync(int id)
        {
            using (var connection = CreateConnection())
            {
                var query = "SELECT * FROM SoilAnalysis WHERE Id = @Id";
                var result = await connection.QueryFirstOrDefaultAsync<SoilAnalysis>(query, new { Id = id });
                return result;
            }
        }

        public async Task<SoilAnalysis> GetLatestByCropProductionIdAsync(int cropProductionId)
        {
            using (var connection = CreateConnection())
            {
                var query = @"
                    SELECT TOP 1 * FROM SoilAnalysis
                    WHERE CropProductionId = @CropProductionId AND Active = 1
                    ORDER BY SampleDate DESC";

                var result = await connection.QueryFirstOrDefaultAsync<SoilAnalysis>(
                    query,
                    new { CropProductionId = cropProductionId }
                );

                return result;
            }
        }

        public async Task<List<SoilTextureClass>> GetAllTextureClassesAsync()
        {
            using (var connection = CreateConnection())
            {
                var query = @"
                    SELECT * FROM SoilTextureClass
                    WHERE Active = 1
                    ORDER BY TextureClassName";

                var result = await connection.QueryAsync<SoilTextureClass>(query);
                return result.ToList();
            }
        }

        public async Task<Dictionary<string, decimal>> GetAvailableNutrientsAsync(int soilAnalysisId)
        {
            using (var connection = CreateConnection())
            {
                // Get soil analysis
                var soilAnalysis = await GetByIdAsync(soilAnalysisId);
                if (soilAnalysis == null || !soilAnalysis.PhSoil.HasValue)
                {
                    return new Dictionary<string, decimal>();
                }

                var ph = soilAnalysis.PhSoil.Value;
                var results = new Dictionary<string, decimal>();

                // Get availability factors for current pH
                var factorsQuery = @"
                    SELECT Nutrient, AvailabilityFactor
                    FROM SoilNutrientAvailability
                    WHERE @Ph BETWEEN PhRangeMin AND PhRangeMax";

                var factors = await connection.QueryAsync<(string Nutrient, decimal AvailabilityFactor)>(
                    factorsQuery,
                    new { Ph = ph }
                );

                var availabilityDict = factors.ToDictionary(f => f.Nutrient, f => f.AvailabilityFactor);

                // Calculate available N
                if (soilAnalysis.TotalNitrogen.HasValue)
                {
                    var nFactor = availabilityDict.ContainsKey("N") ? availabilityDict["N"] : 0.60m;
                    results["N"] = soilAnalysis.TotalNitrogen.Value * nFactor;
                }

                // Calculate available P
                if (soilAnalysis.Phosphorus.HasValue)
                {
                    var pFactor = availabilityDict.ContainsKey("P") ? availabilityDict["P"] : 0.25m;
                    results["P"] = soilAnalysis.Phosphorus.Value * pFactor;
                }

                // Calculate available K
                if (soilAnalysis.Potassium.HasValue)
                {
                    var kFactor = availabilityDict.ContainsKey("K") ? availabilityDict["K"] : 0.80m;
                    results["K"] = soilAnalysis.Potassium.Value * kFactor;
                }

                // Calculate available Ca
                if (soilAnalysis.Calcium.HasValue)
                {
                    var caFactor = availabilityDict.ContainsKey("Ca") ? availabilityDict["Ca"] : 0.85m;
                    results["Ca"] = soilAnalysis.Calcium.Value * caFactor;
                }

                // Calculate available Mg
                if (soilAnalysis.Magnesium.HasValue)
                {
                    var mgFactor = availabilityDict.ContainsKey("Mg") ? availabilityDict["Mg"] : 0.70m;
                    results["Mg"] = soilAnalysis.Magnesium.Value * mgFactor;
                }

                return results;
            }
        }

        public async Task<string> DetermineTextureClassAsync(decimal sand, decimal silt, decimal clay)
        {
            // Validate sum
            if (Math.Abs((sand + silt + clay) - 100) > 2)
            {
                return "Invalid";
            }

            using (var connection = CreateConnection())
            {
                var query = @"
                    SELECT TOP 1 TextureClassName,
                           ABS(@Sand - (SandMin + SandMax) / 2) +
                           ABS(@Silt - (SiltMin + SiltMax) / 2) +
                           ABS(@Clay - (ClayMin + ClayMax) / 2) AS Distance
                    FROM SoilTextureClass
                    WHERE Active = 1
                      AND @Sand BETWEEN SandMin AND SandMax
                      AND @Silt BETWEEN SiltMin AND SiltMax
                      AND @Clay BETWEEN ClayMin AND ClayMax
                    ORDER BY Distance";

                var result = await connection.QueryFirstOrDefaultAsync<string>(
                    query,
                    new { Sand = sand, Silt = silt, Clay = clay }
                );

                return result ?? "Unclassified";
            }
        }
    }
}
