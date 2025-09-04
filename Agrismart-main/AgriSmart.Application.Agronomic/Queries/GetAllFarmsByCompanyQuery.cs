using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllFarmsByCompanyQuery : IRequest<Response<GetAllFarmsResponse>>
    {
        public int CompanyId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}