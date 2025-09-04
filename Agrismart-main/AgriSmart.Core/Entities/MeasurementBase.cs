namespace AgriSmart.Core.Entities
{
    public class MeasurementBase
    {
        public int Id { get; set; }
        public DateTime RecordDate { get; set; }
        public int CropProductionId { get; set; }
        public int MeasurementVariableId { get; set; }
        public int SensorId { get; set; }   
        public double RecordValue {get; set;}
    }
}