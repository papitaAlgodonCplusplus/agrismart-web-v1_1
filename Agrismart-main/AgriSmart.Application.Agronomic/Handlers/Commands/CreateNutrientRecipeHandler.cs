// ==================================================================
// File: AgriSmart.Application.Agronomic/Handlers/Commands/
// ==================================================================

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
    public class CreateNutrientRecipeHandler : IRequestHandler<CreateNutrientRecipeCommand, Response<CreateNutrientRecipeResponse>>
    {
        private readonly AgriSmartContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CreateNutrientRecipeHandler(
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

        public async Task<Response<CreateNutrientRecipeResponse>> Handle(CreateNutrientRecipeCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Create the recipe entity
                var recipe = new NutrientFormulationRecipe
                {
                    Name = request.Name,
                    Description = request.Description,
                    CropId = request.CropId,
                    CropPhaseId = request.CropPhaseId,
                    WaterSourceId = request.WaterSourceId,
                    CatalogId = request.CatalogId,
                    TargetPh = request.TargetPh,
                    TargetEc = request.TargetEc,
                    VolumeLiters = request.VolumeLiters,
                    TargetNitrogen = request.TargetNitrogen,
                    TargetPhosphorus = request.TargetPhosphorus,
                    TargetPotassium = request.TargetPotassium,
                    TargetCalcium = request.TargetCalcium,
                    TargetMagnesium = request.TargetMagnesium,
                    TargetSulfur = request.TargetSulfur,
                    TargetIron = request.TargetIron,
                    AchievedNitrogen = request.AchievedNitrogen,
                    AchievedPhosphorus = request.AchievedPhosphorus,
                    AchievedPotassium = request.AchievedPotassium,
                    AchievedCalcium = request.AchievedCalcium,
                    AchievedMagnesium = request.AchievedMagnesium,
                    AchievedSulfur = request.AchievedSulfur,
                    AchievedIron = request.AchievedIron,
                    TotalCost = request.TotalCost,
                    CostPerLiter = request.CostPerLiter,
                    RecipeType = request.RecipeType,
                    Instructions = request.Instructions,
                    Warnings = request.Warnings,
                    Notes = request.Notes,
                    CreatedBy = GetSessionUserId(),
                    DateCreated = DateTime.Now
                };

                await _context.NutrientFormulationRecipes.AddAsync(recipe, cancellationToken);
                await _context.SaveChangesAsync(cancellationToken);

                // Add fertilizers if provided
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
                            CreatedBy = GetSessionUserId(),
                            DateCreated = DateTime.Now
                        };

                        await _context.NutrientFormulationRecipeFertilizers.AddAsync(recipeFertilizer, cancellationToken);
                    }
                }

                await _context.SaveChangesAsync(cancellationToken);

                return new Response<CreateNutrientRecipeResponse>(new CreateNutrientRecipeResponse
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Message = "Recipe created successfully"
                });
            }
            catch (Exception ex)
            {
                return new Response<CreateNutrientRecipeResponse>(ex);
            }
        }
    }
}