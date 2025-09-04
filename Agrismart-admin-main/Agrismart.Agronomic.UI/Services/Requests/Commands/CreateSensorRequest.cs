namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateSensorRequest
    {
        public int DeviceId { get; set; }
        public string? SensorLabel { get; set; }
        public string? Description { get; set; }
        //        public int DeviceRX { get; set; }
        public int MeasurementVariableId { get; set; }
        public int NumberOfContainers { get; set; }
    }
}
