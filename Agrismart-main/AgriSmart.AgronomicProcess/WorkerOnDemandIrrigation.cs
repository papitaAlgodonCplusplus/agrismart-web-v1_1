using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Logic;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Services.Responses;
using Microsoft.Extensions.Options;

namespace AgriSmart.AgronomicProcess
{
    public class WorkerOnDemandIrrigation : BackgroundService
    {
        private readonly ILogger<WorkerOnDemandIrrigation> _logger;

        /// <summary>
        /// Configuration properties
        /// </summary>
        private readonly AgronomicProcessConfiguration _agronomicProcessConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private readonly BusinessEntity businessEntity;
        //private MeasurementProcess measurementProcess;
        private LoginResponse session;

        public WorkerOnDemandIrrigation(ILogger<WorkerOnDemandIrrigation> logger, IOptions<AgronomicProcessConfiguration> agronomicProcessConfiguration, IOptions<AgrismartApiConfiguration> agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        {
            _logger = logger;
            _agronomicProcessConfiguration = agronomicProcessConfiguration.Value;
            _agrismartApiConfiguration = agrismartApiConfiguration.Value;
            _agriSmartApiClient = agriSmartApiClient;

            businessEntity = new BusinessEntity(_logger, _agronomicProcessConfiguration, _agrismartApiConfiguration, _agriSmartApiClient);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Worker started at: {time}", DateTimeOffset.Now);

            try
            {
                session = await businessEntity.CreateApiSessionAsync();

                if (session.RoleId == 0)
                {
                    await businessEntity.CreateBusinessEntityAsync(session.Token);

                    IrrigationMonitor irrigationMonitor = new IrrigationMonitor(_logger, _agrismartApiConfiguration, _agriSmartApiClient);

                    IList<CropProductionEntity> cropProductionEntities = await businessEntity.GetCropProductionEntities(session.Token);
                    
                    await irrigationMonitor.SetCropProductionsToIrrigate(cropProductionEntities, session.Token, stoppingToken);

                    await Task.Delay(TimeSpan.FromMinutes(3), stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ExecuteAsync failed.");
            }
        }
    }
}