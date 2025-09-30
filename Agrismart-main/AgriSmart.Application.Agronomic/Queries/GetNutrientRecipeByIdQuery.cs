
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetNutrientRecipeByIdQuery : IRequest<Response<GetNutrientRecipeByIdResponse>>
    {
        public int Id { get; set; }
    }
}