using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllMeasurementVariablesQuery : IRequest<Response<GetAllMeasurementVariablesResponse>>
    {
        public int CatalogId { get; set; }
    }
}