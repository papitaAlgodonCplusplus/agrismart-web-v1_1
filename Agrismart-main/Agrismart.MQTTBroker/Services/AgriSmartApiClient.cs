using AgriSmart.MQTTBroker.Configuration;
using AgriSmart.MQTTBroker.Models;
using Newtonsoft.Json;
using System.Text;

namespace AgriSmart.MQTTBroker.Services
{
    public class AgriSmartApiClient : IDisposable
    {
        private readonly ILogger _logger;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;

        private bool _disposedValue;

        public AgriSmartApiClient(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration) {
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
        }

        public async Task<bool> AuthenticateMqttClient(string connectUsername, string connectPassword)
        {
            try
            {
                var authenticateData = new
                {
                    connectUsername = connectUsername,
                    connectPassword = connectPassword
                };

                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        var jsonAuthenticateData = JsonConvert.SerializeObject(authenticateData);
                        var stringContent = new StringContent(jsonAuthenticateData, Encoding.UTF8, "application/json");

                        var response = await client.PostAsync(_agrismartApiConfiguration.AuthenticateMqttClientUrl, stringContent);

                        if (response.IsSuccessStatusCode)
                        {
                            var authenticateMqttClientResult = response.Content.ReadAsStringAsync();
                            _logger.LogInformation(authenticateMqttClientResult.Result);
                            return true;
                        }
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return false;
            }           
        }

        public async Task<bool> PostMqttMessage(IotMessage message)
        {
            try
            {
                var mqttDeviceRawData = new
                {
                    RecordDate = DateTime.Now,
                    ClientId = message.ClientId,
                    UserId = message.Topic.UserId,
                    DeviceId = message.Topic.DeviceId,
                    Sensor = message.Topic.Sensor,
                    Payload = message.Payload
                };

                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        var jsonMqttDeviceRawData = JsonConvert.SerializeObject(mqttDeviceRawData);
                        var stringContent = new StringContent(jsonMqttDeviceRawData, Encoding.UTF8, "application/json");

                        var response = await client.PostAsync(_agrismartApiConfiguration.PostMqttMessageUrl, stringContent);

                        if (response.IsSuccessStatusCode)
                        {
                            var postMqttMessageResult = response.Content.ReadAsStringAsync();
                            _logger.LogInformation(postMqttMessageResult.Result);
                            return true;
                        }
                        else
                        {
                            _logger.LogError(response.RequestMessage.Content.ReadAsStream().ToString());
                        }
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return false;
            }
        }


        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects)
                }

                // TODO: free unmanaged resources (unmanaged objects) and override finalizer
                // TODO: set large fields to null
                _disposedValue = true;
            }
        }

        // // TODO: override finalizer only if 'Dispose(bool disposing)' has code to free unmanaged resources
        // ~AgriSmartApiClient()
        // {
        //     // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
        //     Dispose(disposing: false);
        // }

        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
