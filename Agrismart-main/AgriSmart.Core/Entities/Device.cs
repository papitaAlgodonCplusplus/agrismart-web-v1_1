using System.Text.Json.Serialization;

namespace AgriSmart.Core.Entities
{
    public class Device : BaseEntity
    {
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool Active { get; set; }
        public List<Sensor> Sensors { get; set; } = new();
    }
}
