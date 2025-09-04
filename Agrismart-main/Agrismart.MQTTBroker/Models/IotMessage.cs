namespace AgriSmart.MQTTBroker.Models
{
    public record IotMessage
    {
        public string? ClientId { get; set; }
        public IotTopic? Topic { get; set; }
        public string? Payload { get; set; }

        public IotMessage(string? clientId, string? topic, string? payload)
        {
            ClientId = clientId;
            Topic = new IotTopic(topic);
            Payload = payload;
        }
    }
}
