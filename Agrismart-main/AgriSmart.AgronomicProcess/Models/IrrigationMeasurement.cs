namespace AgriSmart.AgronomicProcess.Models
{
    public class IrrigationMeasurement
    {
        public long Id { get; set; }
        public int EventId { get; set; }
        public int MeasurementVariableId { get; set; }
        public double RecordValue { get; set; }


    }
}
