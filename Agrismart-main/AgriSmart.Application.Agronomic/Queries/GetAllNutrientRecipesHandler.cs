
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
                    Fertilizers = fertilizers.Where(f => f.RecipeId == r.Id)
                        .Select(f => new RecipeFertilizerDetailDto
                        {
                            FertilizerId = f.FertilizerId,
                            FertilizerName = f.Fertilizer?.Name,
                            ConcentrationGramsPerLiter = f.ConcentrationGramsPerLiter,
                            TotalGrams = f.TotalGrams,
                            TotalCost = f.TotalCost
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
