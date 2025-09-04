using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateIrrigationEventCommand : IRequest<Response<CreateIrrigationEventResponse>>
    {
        public long Id { get; set; }
        public DateTime RecordDateTime { get; set; }
        public int CropProductionId { get; set; }
        public DateTime DateTimeStart { get; set; }
        public DateTime DateTimeEnd { get; set; }
        public List<CreateIrrigationEventMeasurementCommand> CreateIrrigationEventMeasurements { get; set; }
    }
}
