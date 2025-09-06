using AgriSmart.MQTTBroker;
using AgriSmart.MQTTBroker.Configuration;
using Microsoft.Extensions.Logging.EventLog;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((hostContext, services) =>
    {
        services.Configure<BrokerConfiguration>(hostContext.Configuration.GetSection("BrokerConfiguration"));
        services.Configure<AgrismartApiConfiguration>(hostContext.Configuration.GetSection("AgrismartApiConfiguration"));
        services.AddHostedService<Worker>();

        services.Configure<EventLogSettings>(options =>
        {
            options.SourceName = "AgrismartMqttBroker";
        });
    })
    //.UseWindowsService
    .Build();

await host.RunAsync();
