using AgriSmart.OnDemandIrrigation.Configuration;
using AgriSmart.OnDemandIrrigation.Logic;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using AgriSmart.OnDemandIrrigation.Services.Responses;
using AgriSmart.Calculator.Logic;

namespace AgriSmart.OnDemandIrrigation
{
    public class Worker : BackgroundService
    {
        private readonly ILogger<Worker> _logger;

        /// <summary>
        /// Configuration properties
        /// </summary>
        //private readonly AgronomicProcessConfiguration _agronomicProcessConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;

        //private readonly BusinessEntity businessEntity;
        private readonly OnDemandIrrigationProcess onDemandIrrigationProcess;

        public Worker(ILogger<Worker> logger, IOptions<AgrismartApiConfiguration> agrismartApiConfiguration)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));

            // Validate that the configuration was injected properly
            if (agrismartApiConfiguration?.Value == null)
            {
                throw new ArgumentNullException(nameof(agrismartApiConfiguration), "AgrismartApiConfiguration was not properly configured.");
            }

            _agrismartApiConfiguration = agrismartApiConfiguration.Value;

            // Validate critical configuration properties
            if (string.IsNullOrEmpty(_agrismartApiConfiguration.BaseAddress))
            {
                throw new InvalidOperationException("BaseAddress is required in AgrismartApiConfiguration.");
            }
            if (string.IsNullOrEmpty(_agrismartApiConfiguration.AuthenticationUrl))
            {
                throw new InvalidOperationException("AuthenticationUrl is required in AgrismartApiConfiguration.");
            }

            // Log configuration values to check for nulls
            _logger.LogInformation($"BaseAddress: {_agrismartApiConfiguration.BaseAddress}");
            _logger.LogInformation($"AuthenticationUrl: {_agrismartApiConfiguration.AuthenticationUrl}");
            _logger.LogInformation($"GetClientsUrl: {_agrismartApiConfiguration.GetClientsUrl}");
            _logger.LogInformation($"GetCompaniesUrl: {_agrismartApiConfiguration.GetCompaniesUrl}");
            _logger.LogInformation($"GetFarmsUrl: {_agrismartApiConfiguration.GetFarmsUrl}");
            _logger.LogInformation($"GetProductionUnitsUrl: {_agrismartApiConfiguration.GetProductionUnitsUrl}");
            _logger.LogInformation($"GetCropProductionsUrl: {_agrismartApiConfiguration.GetCropProductionsUrl}");
            _logger.LogInformation($"GetCropsUrl: {_agrismartApiConfiguration.GetCropsUrl}");
            _logger.LogInformation($"GetContainerUrl: {_agrismartApiConfiguration.GetContainerUrl}");
            _logger.LogInformation($"GetCropUrl: {_agrismartApiConfiguration.GetCropUrl}");
            _logger.LogInformation($"GetDevicesUrl: {_agrismartApiConfiguration.GetDevicesUrl}");
            _logger.LogInformation($"GetGrowingMediumUrl: {_agrismartApiConfiguration.GetGrowingMediumUrl}");
            _logger.LogInformation($"GetCropProductionIrrigationSectorUrl: {_agrismartApiConfiguration.GetCropProductionIrrigationSectorUrl}");
            _logger.LogInformation($"GetMeasurementKPILatestUrl: {_agrismartApiConfiguration.GetMeasurementKPILatestUrl}");
            _logger.LogInformation($"GetMeasurementsKPIUrl: {_agrismartApiConfiguration.GetMeasurementsKPIUrl}");
            _logger.LogInformation($"GetMeasurementUrl: {_agrismartApiConfiguration.GetMeasurementUrl}");
            _logger.LogInformation($"GetMeasurementVariableStandardUrl: {_agrismartApiConfiguration.GetMeasurementVariableStandardUrl}");
            _logger.LogInformation($"GetMeasurementVariablesUrl: {_agrismartApiConfiguration.GetMeasurementVariablesUrl}");
            _logger.LogInformation($"GetIrrigationEventsUrl: {_agrismartApiConfiguration.GetIrrigationEventsUrl}");
            _logger.LogInformation($"GetIrrigationMeasurementUrl: {_agrismartApiConfiguration.GetIrrigationMeasurementUrl}");
            _logger.LogInformation($"ProcessDeviceRawDataClimateMeasurementsUrl: {_agrismartApiConfiguration.ProcessDeviceRawDataClimateMeasurementsUrl}");

            try
            {
                onDemandIrrigationProcess = new OnDemandIrrigationProcess(_logger, _agrismartApiConfiguration);

                LoginResponse session = onDemandIrrigationProcess.CreateApiSession();

                if (session?.RoleId == 0 && !string.IsNullOrEmpty(session.Token))
                {
                    onDemandIrrigationProcess.CalculationCalculate(session.Token);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing OnDemandIrrigationProcess");
                throw;
            }
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("Worker running at: {time}", DateTimeOffset.Now);

                //calculate.CalculateClimateMeasurements(businessEntity.GetDevices());

                await Task.Delay(1000, stoppingToken);
            }
        }
    }
}