using AgriSmart.MQTTBroker.Configuration;
using AgriSmart.MQTTBroker.Logic;
using AgriSmart.MQTTBroker.Models;
using AgriSmart.MQTTBroker.Services;
using Microsoft.Extensions.Options;

namespace AgriSmart.MQTTBroker
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;

        /// <summary>
        /// Configuration properties
        /// </summary>
        private readonly BrokerConfiguration _brokerConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;

        /// <summary>
        /// Logic objects
        /// </summary>
        private readonly AgriSmartMqttServer _agriSmartMqttServer;

        /// <summary>
        /// Control Structs
        /// </summary>
        private readonly List<IotClient> _clientList;
        private readonly Queue<IotMessage> _iotMessages;


        private ManualResetEventSlim _pausedEvent = new ManualResetEventSlim(false);
        private CancellationTokenSource _cancellationTokenSource = new CancellationTokenSource();


        /// <summary>
        /// Constructor
        /// </summary>
        /// <param name="logger"></param>
        /// <param name="brokerConfiguration"></param>
        /// <param name="agrismartApiConfiguration"></param>
        public Worker(ILogger<Worker> logger, IOptions<BrokerConfiguration> brokerConfiguration, IOptions<AgrismartApiConfiguration> agrismartApiConfiguration)
        {
            _logger = logger;

            _brokerConfiguration = brokerConfiguration.Value;
            _agrismartApiConfiguration = agrismartApiConfiguration.Value;

            _clientList = new List<IotClient>();
            _iotMessages = new Queue<IotMessage>();

            _agriSmartMqttServer = new AgriSmartMqttServer(this, _brokerConfiguration);
            _agriSmartMqttServer.StartMqttServer();
            _agriSmartMqttServer.ChangeStatus(true);
        }


        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                if (_pausedEvent.Wait(0))
                {
                    _logger.LogInformation("Worker paused at: {time}", DateTimeOffset.Now);
                    _agriSmartMqttServer.ChangeStatus(false);
                    // The service is paused
                    // Perform any tasks to stop the ongoing work here
                }
                else
                {
                    _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);
                    _agriSmartMqttServer.ChangeStatus(true);
                    while (_iotMessages.Count == 0) { Thread.Sleep(100); }
                    if (_iotMessages.Count > 0)
                    {
                        using (AgriSmartApiClient agriSmartApiClient = new(_logger, _agrismartApiConfiguration))
                        {
                            await agriSmartApiClient.PostMqttMessage(_iotMessages.Dequeue());
                        }
                    }
                }
                await Task.Delay(1000, stoppingToken);
            }
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            _cancellationTokenSource.Cancel();
            _agriSmartMqttServer.ChangeStatus(true);
            return base.StartAsync(cancellationToken);
        }

        public override Task StopAsync(CancellationToken cancellationToken)
        {
            _cancellationTokenSource.Cancel();
            _agriSmartMqttServer.ChangeStatus(false);
            return base.StopAsync(cancellationToken);
        }

        #region public methods

        public async Task<bool> ValidateMqttClient(string userName, string password)
        {
            using (AgriSmartApiClient agriSmartApiClient = new(_logger, _agrismartApiConfiguration))
            {
                var authenticateMqttClientResult = await agriSmartApiClient.AuthenticateMqttClient(userName, password);
                if (authenticateMqttClientResult)
                {
                    return true;
                }
            }
            return false;
        }

        public void AddConnection(IotClient client)
        {
            if (_clientList.Select(p => p.ClientId == client.ClientId).Count() > 0) { return; }
            _clientList.Add(client);

            string log = string.Format("Connection: ClientId = {0}, Endpoint = {1}, Username = {2}, Password = {3}",
                client.ClientId,
                client.EndPoint,
                client.UserName,
                client.Password);

            _logger.LogInformation(log);
        }
        public void AddMessage(IotMessage message)
        {
            _iotMessages.Enqueue(message);

            string log = string.Format("Message: ClientId = {0}, UserId = {1}, DeviceId = {2}, Sensor = {3}, Payload = {4}",
                message.ClientId,
                message.Topic.UserId,
                message.Topic.DeviceId,
                message.Topic.Sensor,
                message.Payload);

            _logger.LogInformation(log);
        }

        #endregion


    }
}