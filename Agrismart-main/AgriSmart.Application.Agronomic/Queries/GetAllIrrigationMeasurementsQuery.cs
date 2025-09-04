using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllIrrigationMeasurementsQuery : IRequest<Response<GetAllIrrigationMeasurementResponse>>
    {
        public int CropProductionId { get; set; }
        public DateTime StartingDateTime { get; set; }
        public DateTime EndingDateTime { get; set; }
    }
}