using AgriSmart.Calculator;
using AgriSmart.Calculator.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.EventLog;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureServices((hostContext, services) =>
    {
        services.Configure<AgrismartApiConfiguration>(hostContext.Configuration.GetSection("AgrismartApiConfiguration"));
        services.AddHostedService<WorkerCalculator>();

        services.Configure<EventLogSettings>(options =>
        {
            options.SourceName = "AgrismartCalculator";
        });
    })
    //.UseWindowsService()
    .Build();

await host.RunAsync();
