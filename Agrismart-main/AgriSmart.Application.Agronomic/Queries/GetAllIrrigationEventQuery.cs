using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllIrrigationEventsQuery : IRequest<Response<GetAllIrrigationEventsResponse>>
    {
        public int CropProductionId { get; set; }
        public DateTime StartingDateTime { get; set; }
        public DateTime EndingDateTime { get; set; }
    }
}