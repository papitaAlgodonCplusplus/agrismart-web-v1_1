
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Responses;
using AgriSmart.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllNutrientRecipesHandler : IRequestHandler<GetAllNutrientRecipesQuery, Response<GetAllNutrientRecipesResponse>>
    {
        private readonly AgriSmartContext _context;

        public GetAllNutrientRecipesHandler(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<Response<GetAllNutrientRecipesResponse>> Handle(GetAllNutrientRecipesQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var query = _context.NutrientFormulationRecipes
                    .Include(r => r.Crop)
                    .Include(r => r.CropPhase)
                    .AsQueryable();

                // Apply filters - Active property doesn't exist in current model

                if (request.CropId.HasValue)
                {
                    query = query.Where(r => r.CropId == request.CropId.Value);
                }

                if (request.CropPhaseId.HasValue)
                {
                    query = query.Where(r => r.CropPhaseId == request.CropPhaseId.Value);
                }

                if (request.CatalogId.HasValue)
                {
                    query = query.Where(r => r.CatalogId == request.CatalogId.Value);
                }

                if (!string.IsNullOrEmpty(request.RecipeType))
                {
                    query = query.Where(r => r.RecipeType == request.RecipeType);
                }

                var recipes = await query.OrderByDescending(r => r.DateCreated).ToListAsync(cancellationToken);

                // Get fertilizers for each recipe
                var recipeIds = recipes.Select(r => r.Id).ToList();
                var fertilizers = await _context.NutrientFormulationRecipeFertilizers
                    .Include(f => f.Fertilizer)
                    .Where(f => recipeIds.Contains(f.RecipeId))
                    .ToListAsync(cancellationToken);

                var recipeDtos = recipes.Select(r => new NutrientFormulationRecipeDto
                {
                    Id = r.Id,
                    Name = r.Name,
                    Description = r.Description,
                    CropId = r.CropId,
                    CropName = r.Crop?.Name,
                    CropPhaseId = r.CropPhaseId,
                    CropPhaseName = r.CropPhase?.Name,
                    TargetPh = r.TargetPh,
                    TargetEc = r.TargetEc,
                    VolumeLiters = r.VolumeLiters,
                    TotalCost = r.TotalCost,
                    CostPerLiter = r.CostPerLiter,
                    RecipeType = r.RecipeType,
                    DateCreated = r.DateCreated ?? DateTime.MinValue,
                    TargetNitrogen = r.TargetNitrogen,
                    TargetPhosphorus = r.TargetPhosphorus,
                    TargetPotassium = r.TargetPotassium,
                    TargetCalcium = r.TargetCalcium,
                    TargetMagnesium = r.TargetMagnesium,
                    TargetSulfur = r.TargetSulfur,
                    TargetIron = r.TargetIron,
                    AchievedNitrogen = r.AchievedNitrogen,
                    AchievedPhosphorus = r.AchievedPhosphorus,
                    AchievedPotassium = r.AchievedPotassium,
                    AchievedCalcium = r.AchievedCalcium,
                    AchievedMagnesium = r.AchievedMagnesium,
                    AchievedSulfur = r.AchievedSulfur,
                    AchievedIron = r.AchievedIron,
                    SoilAnalysisId = r.SoilAnalysisId,
                    FormulationMode = r.FormulationMode,
                    FertigationVolumePerApplication = r.FertigationVolumePerApplication,
                    FertigationApplicationsPerWeek = r.FertigationApplicationsPerWeek,
                    FertigationLeachingFraction = r.FertigationLeachingFraction,
                    FertigationRootDepth = r.FertigationRootDepth,
                    PercentageNitrogen = r.PercentageNitrogen,
                    PercentagePhosphorus = r.PercentagePhosphorus,
                    PercentagePotassium = r.PercentagePotassium,
                    PercentageCalcium = r.PercentageCalcium,
                    PercentageMagnesium = r.PercentageMagnesium,
                    StatusMessage = r.StatusMessage,
                    SummaryLine = r.SummaryLine,
                    Instructions = r.Instructions,
                    Warnings = r.Warnings,
                    Notes = r.Notes,

                    // Advanced Calculator Fields
                    OptimizationMethod = r.OptimizationMethod,
                    OptimizationStatus = r.OptimizationStatus,
                    TotalDosageGramsPerLiter = r.TotalDosageGramsPerLiter,
                    SolverTimeSeconds = r.SolverTimeSeconds,
                    IonicBalanceError = r.IonicBalanceError,
                    AverageDeviationPercent = r.AverageDeviationPercent,
                    SuccessRatePercent = r.SuccessRatePercent,
                    CalculationResultsJson = r.CalculationResultsJson,

                    // Advanced Calculation Data JSON
                    CalculationDataUsedJson = r.CalculationDataUsedJson,
                    IntegrationMetadataJson = r.IntegrationMetadataJson,
                    OptimizationSummaryJson = r.OptimizationSummaryJson,
                    PerformanceMetricsJson = r.PerformanceMetricsJson,
                    CostAnalysisJson = r.CostAnalysisJson,
                    NutrientDiagnosticsJson = r.NutrientDiagnosticsJson,
                    LinearProgrammingAnalysisJson = r.LinearProgrammingAnalysisJson,
                    DataSourcesJson = r.DataSourcesJson,
                    FertilizerDosagesJson = r.FertilizerDosagesJson,
                    VerificationResultsJson = r.VerificationResultsJson,

                    // Quick Access Fields
                    LinearProgrammingEnabled = r.LinearProgrammingEnabled,
                    ActiveFertilizerCount = r.ActiveFertilizerCount,
                    CalculationTimestamp = r.CalculationTimestamp,
                    CatalogIdUsed = r.CatalogIdUsed,
                    PhaseIdUsed = r.PhaseIdUsed,
                    WaterIdUsed = r.WaterIdUsed,
                    UserIdUsed = r.UserIdUsed,
                    ApiPriceCoveragePercent = r.ApiPriceCoveragePercent,
                    CostPerM3Crc = r.CostPerM3Crc,
                    FertilizersAnalyzed = r.FertilizersAnalyzed,
                    SafetyCapsApplied = r.SafetyCapsApplied,
                    StrictCapsMode = r.StrictCapsMode,

                    // Additional Nutrients
                    TargetChloride = r.TargetChloride,
                    AchievedChloride = r.AchievedChloride,
                    TargetSodium = r.TargetSodium,
                    AchievedSodium = r.AchievedSodium,
                    TargetAmmonium = r.TargetAmmonium,
                    AchievedAmmonium = r.AchievedAmmonium,
                    TargetManganese = r.TargetManganese,
                    AchievedManganese = r.AchievedManganese,
                    TargetZinc = r.TargetZinc,
                    AchievedZinc = r.AchievedZinc,
                    TargetCopper = r.TargetCopper,
                    AchievedCopper = r.AchievedCopper,
                    TargetBoron = r.TargetBoron,
                    AchievedBoron = r.AchievedBoron,
                    TargetMolybdenum = r.TargetMolybdenum,
                    AchievedMolybdenum = r.AchievedMolybdenum,

                    // PDF Report
                    PdfReportFilename = r.PdfReportFilename,
                    PdfReportGenerated = r.PdfReportGenerated,

                    Fertilizers = fertilizers.Where(f => f.RecipeId == r.Id)
                        .Select(f => new RecipeFertilizerDetailDto
                        {
                            FertilizerId = f.FertilizerId,
                            FertilizerName = f.Fertilizer?.Name,
                            ConcentrationGramsPerLiter = f.ConcentrationGramsPerLiter,
                            TotalGrams = f.TotalGrams,
                            TotalCost = f.TotalCost,
                            NitrogenContribution = f.NitrogenContribution,
                            PhosphorusContribution = f.PhosphorusContribution,
                            PotassiumContribution = f.PotassiumContribution,
                            CalciumContribution = f.CalciumContribution,
                            MagnesiumContribution = f.MagnesiumContribution,
                            SulfurContribution = f.SulfurContribution,
                            PercentageOfN = f.PercentageOfN,
                            PercentageOfP = f.PercentageOfP,
                            PercentageOfK = f.PercentageOfK
                        }).ToList()
                }).ToList();

                return new Response<GetAllNutrientRecipesResponse>(new GetAllNutrientRecipesResponse
                {
                    Recipes = recipeDtos
                });
            }
            catch (Exception ex)
            {
                return new Response<GetAllNutrientRecipesResponse>(ex);
            }
        }
    }
}
