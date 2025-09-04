using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetLatestMeasurementKPIsQuery : IRequest<Response<GetLatestMeasurementKPIsResponse>>
    {
        public int CropProductionId { get; set; }
        public int KPIId { get; set; }
        public DateTime PeriodStartingDate { get; set; }
        public DateTime PeriodEndingDate { get; set; }
    }
}