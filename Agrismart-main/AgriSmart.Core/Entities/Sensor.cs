namespace AgriSmart.Core.Entities
{
    public class Sensor : BaseEntity
    {
        public int DeviceId { get; set; }
        public string? SensorLabel { get; set; }
        public string? Description { get; set; }
        public int MeasurementVariableId { get; set; }
        public int NumberOfContainers {  get; set; }
        public bool Active { get; set; }
        public Device Device { get; set; }
    }
}
