using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllProductionUnitTypesQuery : IRequest<Response<GetAllProductionUnitTypesResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}