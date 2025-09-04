namespace AgriSmart.Core.Entities
{
    public class IrrigationMeasurement
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public int MeasurementVariableId { get; set; }
        public double RecordValue { get; set; }
    }
}
