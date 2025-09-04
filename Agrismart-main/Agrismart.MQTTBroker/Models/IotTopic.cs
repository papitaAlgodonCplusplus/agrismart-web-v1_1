namespace AgriSmart.MQTTBroker.Models
{
    public record IotTopic
    {
        public string? UserId { get; set; }
        public string? DeviceId { get; set; }
        public string? Sensor { get; set; }

        public IotTopic(string? topic)
        {
            if (topic != null)
            {
                string[] strings = topic.Split('/');
                UserId = strings[0];
                DeviceId = strings[1];
                Sensor = strings[2];
            }
        }
    }
}
