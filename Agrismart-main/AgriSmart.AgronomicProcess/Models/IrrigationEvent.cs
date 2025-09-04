namespace AgriSmart.AgronomicProcess.Models
{
    public class IrrigationEvent
    {
        public long Id { get; set; }
        public DateTime RecordDateTime { get; set; }
        public int CropProductionId { get; set; }
        public DateTime DateTimeStart { get; set; } = DateTime.MinValue;
        public DateTime DateTimeEnd { get; set; } = DateTime.MinValue;
        public List<IrrigationMeasurement> Measurements { get; set; } = new();

    }
}
