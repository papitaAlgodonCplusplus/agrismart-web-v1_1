using AgriSmart.AgronomicProcess;
using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.Calculator;
using Microsoft.Extensions.Logging.EventLog;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((hostContext, services) =>
    {
        services.Configure<AgronomicProcessConfiguration>(hostContext.Configuration.GetSection("AgronomicProcessConfiguration"));
        services.Configure<AgrismartApiConfiguration>(hostContext.Configuration.GetSection("AgrismartApiConfiguration"));
        services.AddHttpClient<IAgriSmartApiClient, AgriSmartApiClient>();
        services.AddHostedService<WorkerRawData>();

        services.Configure<EventLogSettings>(options =>
        {
            options.SourceName = "AgrismartAgronomicProcess";
        });
    })
    //.UseWindowsService()
    .Build();

await host.RunAsync();
