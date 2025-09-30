
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Responses;
using AgriSmart.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetNutrientRecipeByIdHandler : IRequestHandler<GetNutrientRecipeByIdQuery, Response<GetNutrientRecipeByIdResponse>>
    {
        private readonly AgriSmartContext _context;

        public GetNutrientRecipeByIdHandler(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<Response<GetNutrientRecipeByIdResponse>> Handle(GetNutrientRecipeByIdQuery request, CancellationToken cancellationToken)
        {
            try
            {
                var recipe = await _context.NutrientFormulationRecipes
                    .Include(r => r.Crop)
                    .Include(r => r.CropPhase)
                    .FirstOrDefaultAsync(r => r.Id == request.Id, cancellationToken);

                if (recipe == null)
                {
                    return new Response<GetNutrientRecipeByIdResponse>(new Exception($"Recipe with ID {request.Id} not found"));
                }

                var fertilizers = await _context.NutrientFormulationRecipeFertilizers
                    .Include(f => f.Fertilizer)
                    .Where(f => f.RecipeId == request.Id)
                    .ToListAsync(cancellationToken);

                var recipeDto = new NutrientFormulationRecipeDto
                {
                    Id = recipe.Id,
                    Name = recipe.Name,
                    Description = recipe.Description,
                    CropId = recipe.CropId,
                    CropName = recipe.Crop?.Name,
                    CropPhaseId = recipe.CropPhaseId,
                    CropPhaseName = recipe.CropPhase?.Name,
                    TargetPh = recipe.TargetPh,
                    TargetEc = recipe.TargetEc,
                    VolumeLiters = recipe.VolumeLiters,
                    TotalCost = recipe.TotalCost,
                    CostPerLiter = recipe.CostPerLiter,
                    RecipeType = recipe.RecipeType,
                    DateCreated = recipe.DateCreated ?? DateTime.MinValue,
                    Fertilizers = fertilizers.Select(f => new RecipeFertilizerDetailDto
                    {
                        FertilizerId = f.FertilizerId,
                        FertilizerName = f.Fertilizer?.Name,
                        ConcentrationGramsPerLiter = f.ConcentrationGramsPerLiter,
                        TotalGrams = f.TotalGrams,
                        TotalCost = f.TotalCost
                    }).ToList()
                };

                return new Response<GetNutrientRecipeByIdResponse>(new GetNutrientRecipeByIdResponse
                {
                    Recipe = recipeDto
                });
            }
            catch (Exception ex)
            {
                return new Response<GetNutrientRecipeByIdResponse>(ex);
            }
        }
    }
}
