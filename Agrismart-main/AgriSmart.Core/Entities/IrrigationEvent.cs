using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    public class IrrigationEvent
    {
        public int Id { get; set; }
        public DateTime RecordDateTime { get; set; }
        public int CropProductionId { get; set; }
        public DateTime DateTimeStart { get; set; }
        public DateTime DateTimeEnd { get; set; }
        [NotMapped]
        public List<IrrigationMeasurement> IrrigationMeasurements { get; set; }

    }
}
