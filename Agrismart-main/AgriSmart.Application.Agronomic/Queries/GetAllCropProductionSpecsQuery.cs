using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCropProductionSpecsQuery : IRequest<Response<GetAllCropProductionSpecsResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}
