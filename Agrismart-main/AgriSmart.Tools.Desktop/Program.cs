using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using AgriSmart.Tools.Configuration;
using AgriSmart.Tools.Services;
using Microsoft.Extensions.Logging.EventLog;
using System.Windows.Forms;
using Microsoft.Extensions.Configuration;
using System;

namespace AgriSmart.Tools.Desktop
{
    internal static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            using var host = Host.CreateDefaultBuilder(args)
            .ConfigureAppConfiguration(config =>
                {
                    config.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);
                })
            .ConfigureServices((hostContext, services) =>
            {
                services.Configure<AgrismartApiConfiguration>(hostContext.Configuration.GetSection("AgrismartApiConfiguration"));
                services.AddHttpClient<IAgriSmartApiClient, AgriSmartApiClient>((provider, client) =>
                {
                    var config = provider.GetRequiredService<IConfiguration>();
                    var apiConfig = config.GetSection("AgrismartApiConfiguration").Get<AgrismartApiConfiguration>();

                    client.BaseAddress = new Uri(apiConfig.BaseAddress); // Set it here
                    client.DefaultRequestHeaders.Add("Accept", "application/json");
                });
                services.AddScoped<FrmLogin>();
                services.AddScoped<FrmMain>();

                services.Configure<EventLogSettings>(options =>
                {
                    options.SourceName = "AgriSmart.DesktopApp";
                });
            })
            .Build();

            ApplicationConfiguration.Initialize();
            using var scope = host.Services.CreateScope();
            var loginForm = scope.ServiceProvider.GetRequiredService<FrmLogin>();

            var result = loginForm.ShowDialog();

            if (result == DialogResult.OK)
            {
                var mainForm = scope.ServiceProvider.GetRequiredService<FrmMain>();
                System.Windows.Forms.Application.Run(mainForm); // Starts the message loop with the main form
            }
            else
            {
                // Login failed or was canceled
                Environment.Exit(0); // Exit gracefully
            }
        }
    }
}

