namespace AgriSmart.MQTTBroker.Configuration
{
    public record AgrismartApiConfiguration
    {
        public string? BaseAddress { get; set; }
        public string? AuthenticateMqttClientUrl { get; set; }
        public string? PostMqttMessageUrl { get; set; }
    }
}
