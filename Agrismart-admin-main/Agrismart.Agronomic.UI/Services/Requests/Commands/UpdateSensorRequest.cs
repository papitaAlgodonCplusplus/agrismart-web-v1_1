namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateSensorRequest
    {
        public int Id { get; set; }
        public int DeviceId { get; set; }
        public string? SensorLabel { get; set; }
        public string? Description { get; set; }
        public int MeasurementVariableId { get; set; }
        public int NumberOfContainers { get; set; }
       // public int DeviceRX { get; set; }
        public bool Active { get; set; }
    }
}
