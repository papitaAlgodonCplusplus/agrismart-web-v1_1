using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateIrrigationEventResponse
    {
        public int Id { get; set; }
        public DateTime RecordDateTime { get; set; }
        public int CropProductionId { get; set; }
        public DateTime DateTimeStart { get; set; }
        public DateTime DateTimeEnd { get; set; }

        public List<IrrigationMeasurement> IrrigationMeasurements { get; set; }
    }
}
