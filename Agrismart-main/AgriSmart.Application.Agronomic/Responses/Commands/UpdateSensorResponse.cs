namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateSensorResponse
    {
        public int Id { get; set; }
        public int DeviceId { get; set; }
        public string? SensorLabel { get; set; }
        public string? Description { get; set; }
        public int MeasurementVariableId { get; set; }
        public int NumberOfContainers { get; set; }
        public bool? Active { get; set; }
    }
}
