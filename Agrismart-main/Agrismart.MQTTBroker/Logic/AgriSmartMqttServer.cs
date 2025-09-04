using AgriSmart.MQTTBroker.Configuration;
using AgriSmart.MQTTBroker.Models;
using MQTTnet;
using MQTTnet.Server;
using System.Text;

namespace AgriSmart.MQTTBroker.Logic
{
    public class AgriSmartMqttServer
    {
        private readonly IMqttServer _mqttServer;
        private BrokerConfiguration _brokerConfiguration;

        private static bool _isRunning;
        private static Worker _worker;
        private static List<string> _authenticatedClientIds = new List<string>();

        public AgriSmartMqttServer(Worker worker, BrokerConfiguration brokerConfiguration)
        {
            _worker = worker;
            _brokerConfiguration = brokerConfiguration;
            _mqttServer = new MqttFactory().CreateMqttServer();
        }

        public void StartMqttServer()
        {
            MqttServerOptionsBuilder options = new MqttServerOptionsBuilder()
                                         // set endpoint to localhost
                                         .WithDefaultEndpoint()
                                         // port used will be 707
                                         .WithDefaultEndpointPort(_brokerConfiguration.Port)


                                         // handler for new connections
                                         .WithConnectionValidator(OnNewConnection)

                                         .WithSubscriptionInterceptor(OnNewSubscription)

                                         // handler for new messages
                                         .WithApplicationMessageInterceptor(OnNewMessage);

            _mqttServer.StartAsync(options.Build()).GetAwaiter().GetResult();
        }

        #region Mqtt Events

        private static async void OnNewConnection(MqttConnectionValidatorContext context)
        {
            if (_isRunning)
            {
                var validateMqttClientResult = await _worker.ValidateMqttClient(context.Username, context.Password);
                if (validateMqttClientResult)
                {
                    IotClient iotClient = new IotClient(context.ClientId, context.Endpoint, context.Username, context.Password);
                    context.ReturnCode = MQTTnet.Protocol.MqttConnectReturnCode.ConnectionAccepted;
                    _authenticatedClientIds?.Add(context.ClientId);
                    _worker.AddConnection(iotClient);
                }
                else
                {
                    context.ReturnCode = MQTTnet.Protocol.MqttConnectReturnCode.ConnectionRefusedNotAuthorized;
                }
            }
        }
        private static void OnNewMessage(MqttApplicationMessageInterceptorContext context)
        {
            if (_isRunning)
            {
                if (_authenticatedClientIds.Find(x => x.Equals(context.ClientId)) == context.ClientId)
                {
                    var payload = context.ApplicationMessage?.Payload == null ? null : Encoding.UTF8.GetString(context.ApplicationMessage.Payload);
                    var topic = context.ApplicationMessage?.Topic == null ? null : context.ApplicationMessage.Topic;
                    IotMessage iotMessage = new IotMessage(context.ClientId, topic, payload);
                    _worker.AddMessage(iotMessage);
                    context.AcceptPublish = true;
                }
                else
                {
                    context.AcceptPublish = false;
                }
            }
        }
        private static void OnNewSubscription(MqttSubscriptionInterceptorContext context)
        {
            if (_isRunning)
            {
                if (_authenticatedClientIds.Find(x => x.Equals(context.ClientId)) == context.ClientId)
                {
                    context.AcceptSubscription = true;
                }
                else
                {
                    context.AcceptSubscription = false;
                }
            }
        }

        #endregion

        public void ChangeStatus(bool isRunning)
        {
            _isRunning = isRunning;
        }
    }
}
