namespace AgriSmart.Application.Iot.Responses.Commands
{
    public record AuthenticateMqttClientResponse
    {
        public bool Authenticated { get; set; }
    }
}