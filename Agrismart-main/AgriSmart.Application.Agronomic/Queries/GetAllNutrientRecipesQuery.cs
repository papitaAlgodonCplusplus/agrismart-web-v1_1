
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetAllNutrientRecipesQuery : IRequest<Response<GetAllNutrientRecipesResponse>>
    {
        public int? CropId { get; set; }
        public int? CropPhaseId { get; set; }
        public int? CatalogId { get; set; }
        public string? RecipeType { get; set; }
        public bool IncludeInactives { get; set; } = false;
    }
}
