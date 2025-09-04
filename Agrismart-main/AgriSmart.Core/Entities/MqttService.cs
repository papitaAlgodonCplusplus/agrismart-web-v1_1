using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Entities
{
    public class MqttService : BaseEntity
    {        
        public int CompanyId { get; set; }
        public string? ServiceId { get; set; }
        public string? Password { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}
