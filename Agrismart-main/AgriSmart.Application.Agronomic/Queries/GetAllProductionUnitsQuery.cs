using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllProductionUnitsQuery : IRequest<Response<GetAllProductionUnitsResponse>>
    {
        public int CompanyId { get; set; } = 0;
        public int FarmId { get; set; } = 0;
        public bool IncludeInactives { get; set; }
    }
}