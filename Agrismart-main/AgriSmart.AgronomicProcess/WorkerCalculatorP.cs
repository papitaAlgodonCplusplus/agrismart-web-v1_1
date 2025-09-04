using Microsoft.Extensions.Options;
using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Logic;
using AgriSmart.AgronomicProcess.Services.Responses;
using AgriSmart.AgronomicProcess;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Entities;

namespace AgriSmart.Calculator
{
    public class WorkerCalculatorP : BackgroundService
    {
        private readonly ILogger<WorkerCalculatorP> _logger;

        /// <summary>
        /// Configuration properties
        /// </summary>

        private readonly AgronomicProcessConfiguration _agronomicProcessConfiguration;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly BusinessEntity businessEntity;
        private CalculationsProcess calculationsProcess;
        private LoginResponse session;
        private readonly IAgriSmartApiClient _agriSmartApiClient;

        public WorkerCalculatorP(ILogger<WorkerCalculatorP> logger, IOptions<AgronomicProcessConfiguration> agronomicProcessConfiguration, IOptions<AgrismartApiConfiguration> agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
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

                    calculationsProcess = new CalculationsProcess(_logger, _agrismartApiConfiguration, _agriSmartApiClient);

                    IList<CropProductionEntity> cropProductionEntities = await businessEntity.GetCropProductionEntities(session.Token);

                    await calculationsProcess.Calculate(cropProductionEntities, session.Token, stoppingToken);

                    await Task.Delay(TimeSpan.FromMinutes(15), stoppingToken);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ExecuteAsync failed.");
            }
        }
    }
}