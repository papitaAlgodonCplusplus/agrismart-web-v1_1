
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Responses;
using AgriSmart.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateNutrientRecipeHandler : IRequestHandler<UpdateNutrientRecipeCommand, Response<UpdateNutrientRecipeResponse>>
    {
        private readonly AgriSmartContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public UpdateNutrientRecipeHandler(
            AgriSmartContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private int GetSessionUserId()
        {
            if (_httpContextAccessor.HttpContext?.User?.Claims?.Count() > 0)
                return int.Parse(_httpContextAccessor.HttpContext.User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier)?.Value ?? "0");
            else
                return 0;
        }

        public async Task<Response<UpdateNutrientRecipeResponse>> Handle(UpdateNutrientRecipeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Find existing recipe
                var recipe = await _context.NutrientFormulationRecipes
                    .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

                if (recipe == null)
                {
                    return new Response<UpdateNutrientRecipeResponse>(new Exception($"Recipe with ID {request.Id} not found"));
                }

                // Update recipe properties
                recipe.Name = request.Name;
                recipe.Description = request.Description;
                recipe.CropId = request.CropId;
                recipe.CropPhaseId = request.CropPhaseId;
                recipe.WaterSourceId = request.WaterSourceId;
                recipe.TargetPh = request.TargetPh;
                recipe.TargetEc = request.TargetEc;
                recipe.VolumeLiters = request.VolumeLiters;
                recipe.TargetNitrogen = request.TargetNitrogen;
                recipe.TargetPhosphorus = request.TargetPhosphorus;
                recipe.TargetPotassium = request.TargetPotassium;
                recipe.TargetCalcium = request.TargetCalcium;
                recipe.TargetMagnesium = request.TargetMagnesium;
                recipe.TargetSulfur = request.TargetSulfur;
                recipe.TargetIron = request.TargetIron;
                recipe.AchievedNitrogen = request.AchievedNitrogen;
                recipe.AchievedPhosphorus = request.AchievedPhosphorus;
                recipe.AchievedPotassium = request.AchievedPotassium;
                recipe.AchievedCalcium = request.AchievedCalcium;
                recipe.AchievedMagnesium = request.AchievedMagnesium;
                recipe.AchievedSulfur = request.AchievedSulfur;
                recipe.AchievedIron = request.AchievedIron;
                recipe.TotalCost = request.TotalCost;
                recipe.CostPerLiter = request.CostPerLiter;
                recipe.RecipeType = request.RecipeType;
                recipe.Instructions = request.Instructions;
                recipe.Warnings = request.Warnings;
                recipe.Notes = request.Notes;
                recipe.SoilAnalysisId = request.SoilAnalysisId;
                recipe.FormulationMode = request.FormulationMode;
                recipe.FertigationVolumePerApplication = request.FertigationVolumePerApplication;
                recipe.FertigationApplicationsPerWeek = request.FertigationApplicationsPerWeek;
                recipe.FertigationLeachingFraction = request.FertigationLeachingFraction;
                recipe.FertigationRootDepth = request.FertigationRootDepth;
                recipe.PercentageNitrogen = request.PercentageNitrogen;
                recipe.PercentagePhosphorus = request.PercentagePhosphorus;
                recipe.PercentagePotassium = request.PercentagePotassium;
                recipe.PercentageCalcium = request.PercentageCalcium;
                recipe.PercentageMagnesium = request.PercentageMagnesium;
                recipe.StatusMessage = request.StatusMessage;
                recipe.SummaryLine = request.SummaryLine;

                // Advanced Calculator Fields
                recipe.OptimizationMethod = request.OptimizationMethod;
                recipe.OptimizationStatus = request.OptimizationStatus;
                recipe.TotalDosageGramsPerLiter = request.TotalDosageGramsPerLiter;
                recipe.SolverTimeSeconds = request.SolverTimeSeconds;
                recipe.IonicBalanceError = request.IonicBalanceError;
                recipe.AverageDeviationPercent = request.AverageDeviationPercent;
                recipe.SuccessRatePercent = request.SuccessRatePercent;
                recipe.CalculationResultsJson = request.CalculationResultsJson;

                // Advanced Calculation Data JSON
                recipe.CalculationDataUsedJson = request.CalculationDataUsedJson;
                recipe.IntegrationMetadataJson = request.IntegrationMetadataJson;
                recipe.OptimizationSummaryJson = request.OptimizationSummaryJson;
                recipe.PerformanceMetricsJson = request.PerformanceMetricsJson;
                recipe.CostAnalysisJson = request.CostAnalysisJson;
                recipe.NutrientDiagnosticsJson = request.NutrientDiagnosticsJson;
                recipe.LinearProgrammingAnalysisJson = request.LinearProgrammingAnalysisJson;
                recipe.DataSourcesJson = request.DataSourcesJson;
                recipe.FertilizerDosagesJson = request.FertilizerDosagesJson;
                recipe.VerificationResultsJson = request.VerificationResultsJson;

                // Quick Access Fields
                recipe.LinearProgrammingEnabled = request.LinearProgrammingEnabled;
                recipe.ActiveFertilizerCount = request.ActiveFertilizerCount;
                recipe.CalculationTimestamp = request.CalculationTimestamp;
                recipe.CatalogIdUsed = request.CatalogIdUsed;
                recipe.PhaseIdUsed = request.PhaseIdUsed;
                recipe.WaterIdUsed = request.WaterIdUsed;
                recipe.UserIdUsed = request.UserIdUsed;
                recipe.ApiPriceCoveragePercent = request.ApiPriceCoveragePercent;
                recipe.CostPerM3Crc = request.CostPerM3Crc;
                recipe.FertilizersAnalyzed = request.FertilizersAnalyzed;
                recipe.SafetyCapsApplied = request.SafetyCapsApplied;
                recipe.StrictCapsMode = request.StrictCapsMode;

                // Additional Nutrients
                recipe.TargetChloride = request.TargetChloride;
                recipe.AchievedChloride = request.AchievedChloride;
                recipe.TargetSodium = request.TargetSodium;
                recipe.AchievedSodium = request.AchievedSodium;
                recipe.TargetAmmonium = request.TargetAmmonium;
                recipe.AchievedAmmonium = request.AchievedAmmonium;
                recipe.TargetManganese = request.TargetManganese;
                recipe.AchievedManganese = request.AchievedManganese;
                recipe.TargetZinc = request.TargetZinc;
                recipe.AchievedZinc = request.AchievedZinc;
                recipe.TargetCopper = request.TargetCopper;
                recipe.AchievedCopper = request.AchievedCopper;
                recipe.TargetBoron = request.TargetBoron;
                recipe.AchievedBoron = request.AchievedBoron;
                recipe.TargetMolybdenum = request.TargetMolybdenum;
                recipe.AchievedMolybdenum = request.AchievedMolybdenum;

                // PDF Report
                recipe.PdfReportFilename = request.PdfReportFilename;
                recipe.PdfReportGenerated = request.PdfReportGenerated;

                recipe.UpdatedBy = GetSessionUserId();
                recipe.DateUpdated = DateTime.Now;

                _context.NutrientFormulationRecipes.Update(recipe);

                // Update fertilizers - delete existing and recreate
                var existingFertilizers = await _context.NutrientFormulationRecipeFertilizers
                    .Where(f => f.RecipeId == request.Id)
                    .ToListAsync(cancellationToken);

                _context.NutrientFormulationRecipeFertilizers.RemoveRange(existingFertilizers);

                // Add new fertilizers
                if (request.Fertilizers != null && request.Fertilizers.Any())
                {
                    foreach (var fertDto in request.Fertilizers)
                    {
                        var recipeFertilizer = new NutrientFormulationRecipeFertilizer
                        {
                            RecipeId = recipe.Id,
                            FertilizerId = fertDto.FertilizerId,
                            ConcentrationGramsPerLiter = fertDto.ConcentrationGramsPerLiter,
                            TotalGrams = fertDto.TotalGrams,
                            TotalKilograms = fertDto.TotalKilograms,
                            NitrogenContribution = fertDto.NitrogenContribution,
                            PhosphorusContribution = fertDto.PhosphorusContribution,
                            PotassiumContribution = fertDto.PotassiumContribution,
                            CalciumContribution = fertDto.CalciumContribution,
                            MagnesiumContribution = fertDto.MagnesiumContribution,
                            SulfurContribution = fertDto.SulfurContribution,
                            PercentageOfN = fertDto.PercentageOfN,
                            PercentageOfP = fertDto.PercentageOfP,
                            PercentageOfK = fertDto.PercentageOfK,
                            CostPerUnit = fertDto.CostPerUnit,
                            TotalCost = fertDto.TotalCost,
                            CostPortion = fertDto.CostPortion,
                            ApplicationOrder = fertDto.ApplicationOrder,
                            ApplicationNotes = fertDto.ApplicationNotes,
                            Active = true,
                            CreatedBy = GetSessionUserId(),
                            DateCreated = DateTime.Now
                        };

                        await _context.NutrientFormulationRecipeFertilizers.AddAsync(recipeFertilizer, cancellationToken);
                    }
                }

                await _context.SaveChangesAsync(cancellationToken);

                return new Response<UpdateNutrientRecipeResponse>(new UpdateNutrientRecipeResponse
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Message = "Recipe updated successfully"
                });
            }
            catch (Exception ex)
            {
                return new Response<UpdateNutrientRecipeResponse>(ex);
            }
        }
    }
}
