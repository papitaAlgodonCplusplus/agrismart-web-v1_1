using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllFarmsQuery : IRequest<Response<GetAllFarmsResponse>>
    {
        public int ClientId { get; set; } = 0;
        public int CompanyId { get; set; } = 0;
        public int UserId { get; set; } = 0;
        public bool IncludeInactives { get; set; }
    }
}