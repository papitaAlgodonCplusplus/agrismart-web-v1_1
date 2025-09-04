using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllMeasurementsBaseQuery : IRequest<Response<GetAllMeasurementsBaseResponse>>
    {
        public int CropProductionId { get; set; }
        public int MeasurementVariableId { get; set; }
        public DateTime PeriodStartingDate { get; set; }
        public DateTime PeriodEndingDate { get; set; }
    }
}