using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCropsQuery : IRequest<Response<GetAllCropsResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}