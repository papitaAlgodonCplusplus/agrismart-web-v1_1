using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllMeasurementUnitsQuery : IRequest<Response<GetAllMeasurementUnitResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}