namespace AgriSmart.MQTTBroker.Models
{
    public record IotClient
    {
        public string ClientId { get; set; }
        public string EndPoint { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }

        public IotClient(string clientId, string endPoint, string userName, string password)
        {
            ClientId = clientId;
            EndPoint = endPoint;
            UserName = userName;
            Password = password;
        }
    }
}
