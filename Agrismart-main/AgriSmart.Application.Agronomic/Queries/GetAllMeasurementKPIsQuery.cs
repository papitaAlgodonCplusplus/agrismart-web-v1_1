using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllMeasurementKPIsQuery : IRequest<Response<GetAllMeasurementKPIsResponse>>
    {
        public int CropProductionId { get; set; }
        public int KPIId { get; set; }
        public DateTime PeriodStartingDate { get; set; }
        public DateTime PeriodEndingDate { get; set; }
    }
}