using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Logic;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Services.Responses;
using Microsoft.Extensions.Options;

namespace AgriSmart.AgronomicProcess
{
    public class WorkerRawData : BackgroundService
    {
        private readonly ILogger<WorkerRawData> _logger;

        /// <summary>
        /// Configuration properties
        /// </summary>
        private readonly AgronomicProcessConfiguration _agronomicProcessConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private MeasurementProcess measurementProcess;
        private LoginResponse? _session;

        public WorkerRawData(ILogger<WorkerRawData> logger, IOptions<AgronomicProcessConfiguration> agronomicProcessConfiguration, IOptions<AgrismartApiConfiguration> agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        {
            _logger = logger;
            _agronomicProcessConfiguration = agronomicProcessConfiguration.Value;
            _agrismartApiConfiguration = agrismartApiConfiguration.Value;
            _agriSmartApiClient = agriSmartApiClient;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Worker started at: {time}", DateTimeOffset.Now);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var businessEntity = new BusinessEntity(_logger, _agronomicProcessConfiguration, _agrismartApiConfiguration, _agriSmartApiClient);

                    // Step 1: Use cached session if valid
                    if (_session == null || DateTime.UtcNow > _session.ValidTo) // You'll define IsExpired()
                    {
                        _logger.LogInformation("Creating new API session...");
                        _session = await businessEntity.CreateApiSessionAsync();

                        if (_session == null || _session.RoleId != 0)
                        {
                            _logger.LogWarning("Invalid session, skipping cycle.");
                            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                            continue;
                        }

                        _logger.LogInformation("Session created.");
                        //await businessEntity.CreateBusinessEntityAsync(_session.Token);
                    }

                    if (_session.RoleId == 0)
                    {
                        await businessEntity.CreateBusinessEntityAsync(_session.Token);

                        MeasurementProcess measurementProcess = new MeasurementProcess(_session.Token, _logger, _agrismartApiConfiguration, _agriSmartApiClient);

                        await measurementProcess.CalculateMeasurements(businessEntity.GetCropProductions(), _session.Token, stoppingToken);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "ExecuteAsync failed.");
                }

                await Task.Delay(TimeSpan.FromMinutes(3), stoppingToken);

            }
        }
    }
}