using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCompaniesQuery : IRequest<Response<GetAllCompaniesResponse>>
    {
        public int ClientId { get; set; } = 0;
        public bool IncludeInactives { get; set; }
    }
}