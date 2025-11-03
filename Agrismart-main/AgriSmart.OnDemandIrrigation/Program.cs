using AgriSmart.OnDemandIrrigation;
using AgriSmart.OnDemandIrrigation.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.EventLog;
using Microsoft.Extensions.Configuration;

IHost host = Host.CreateDefaultBuilder(args)
    .ConfigureAppConfiguration((hostContext, config) =>
    {
        // Clear existing providers to avoid conflicts
        config.Sources.Clear();
        
        // Add configuration files in the correct order
        config.SetBasePath(AppContext.BaseDirectory)
              .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
              .AddJsonFile($"appsettings.{hostContext.HostingEnvironment.EnvironmentName}.json", optional: true, reloadOnChange: true)
              .AddEnvironmentVariables();
    })
    .ConfigureServices((hostContext, services) =>
    {
        Console.WriteLine($"Config file path: {AppContext.BaseDirectory}");
        Console.WriteLine($"Environment: {hostContext.HostingEnvironment.EnvironmentName}");
        
        var configSection = hostContext.Configuration.GetSection("AgrismartApiConfiguration");
        var config = configSection.Get<AgrismartApiConfiguration>();
        
        Console.WriteLine("Loaded AgrismartApiConfiguration from merged config:");
        Console.WriteLine($"BaseAddress: {config?.BaseAddress}");
        Console.WriteLine($"AuthenticationUrl: {config?.AuthenticationUrl}");
        Console.WriteLine($"GetCompaniesUrl: {config?.GetCompaniesUrl}");

        // Validate that configuration was loaded properly
        if (config == null || string.IsNullOrEmpty(config.BaseAddress))
        {
            throw new InvalidOperationException("AgrismartApiConfiguration could not be loaded or is invalid. Check your appsettings.json file.");
        }

        // Try to read from appsettings.Development.json directly for debugging
        var devConfig = new ConfigurationBuilder()
            .SetBasePath(AppContext.BaseDirectory)
            .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: false)
            .Build()
            .GetSection("AgrismartApiConfiguration")
            .Get<AgrismartApiConfiguration>();
        Console.WriteLine("Loaded AgrismartApiConfiguration from appsettings.Development.json:");
        Console.WriteLine($"BaseAddress: {devConfig?.BaseAddress}");
        Console.WriteLine($"AuthenticationUrl: {devConfig?.AuthenticationUrl}");
        Console.WriteLine($"GetCompaniesUrl: {devConfig?.GetCompaniesUrl}");

        services.Configure<AgrismartApiConfiguration>(configSection);
        services.AddHostedService<Worker>();

        services.Configure<EventLogSettings>(options =>
        {
            options.SourceName = "AgrismartCalculator";
        });
    })
    .UseWindowsService()
    .Build();

await host.RunAsync();