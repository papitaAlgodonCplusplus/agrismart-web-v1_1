namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record SensorResponse
    {
        public int Id { get; set; }
        public int DeviceId { get; set; }
        public string? SensorLabel { get; set; }
        public string? Description { get; set; }
        public int DeviceRX { get; set; }
        public bool Active { get; set; }
    }
}
