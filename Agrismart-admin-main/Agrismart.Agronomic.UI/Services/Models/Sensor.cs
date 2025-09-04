namespace Agrismart.Agronomic.UI.Services.Models
{
    public record Sensor
    {
        public int Id { get; set; }
        public int DeviceId { get; set; }
        public string? SensorLabel { get; set; }
        public string? Description { get; set; }
        public int DeviceRX { get; set; }
        public int MeasurementVariableId { get; set; }
        public int NumberOfContainers { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}