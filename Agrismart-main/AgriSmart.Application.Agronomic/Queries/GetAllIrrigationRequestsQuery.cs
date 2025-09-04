using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System.Configuration;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllIrrigationRequestsQuery : IRequest<Response<GetAllIrrigationRequestsResponse>>
    {
        public int ClientId { get; set; }
        public int CompanyId { get; set; }
        public int FarmId { get; set; }
        public int ProductionUnitId { get; set; }
        public int CropProductionId { get; set; }
    }
}