using AgriSmart.Calculator.Configuration;
using AgriSmart.Calculator.Logic;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AgriSmart.Calculator.Services.Responses;

namespace AgriSmart.Calculator
{
    public class WorkerCalculator : BackgroundService
    {
        private readonly ILogger<WorkerCalculator> _logger;

        /// <summary>
        /// Configuration properties
        /// </summary>
        //private readonly AgronomicProcessConfiguration _agronomicProcessConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly BusinessEntity businessEntity;
        private readonly CalculationsProcess calculationsProcess;
        private readonly LoginResponse session;

        public WorkerCalculator(ILogger<WorkerCalculator> logger, IOptions<AgrismartApiConfiguration> agrismartApiConfiguration)
        {
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration.Value;

            businessEntity = new BusinessEntity(_logger, _agrismartApiConfiguration);
            calculationsProcess = new CalculationsProcess(_logger, _agrismartApiConfiguration); // Initialize before use

            session = calculationsProcess.CreateApiSession();

            // FIX ENTRY 0
            // if (session.RoleId == 0)
            // {
            //     calculationsProcess = new CalculationsProcess(_logger, _agrismartApiConfiguration); // This line is not needed anymore
            // }
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

                // FIX ENTRY 1
                if (session == null)
                {
                    _logger.LogWarning("Session is null. Skipping calculation.");
                }
                else if (string.IsNullOrEmpty(session.Token))
                {
                    _logger.LogWarning("Session token is null or empty. Skipping calculation.");
                }
                else
                {
                    calculationsProcess.CalculationCalculate(session.Token);
                }

                //calculate.CalculateClimateMeasurements(businessEntity.GetDevices());

                await Task.Delay(10000, stoppingToken);
            }
        }
    }
}