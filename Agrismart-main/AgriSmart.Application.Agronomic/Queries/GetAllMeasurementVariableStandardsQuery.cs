using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllMeasurementVariableStandardsQuery : IRequest<Response<GetAllMeasurementVariableStandardsResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}