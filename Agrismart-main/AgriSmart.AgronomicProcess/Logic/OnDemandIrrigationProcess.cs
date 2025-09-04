using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Entities;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class OnDemandIrrigationProcess
    {
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly ILogger _logger;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private string _token = string.Empty;

        public OnDemandIrrigationProcess(ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        {
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;
        }


        public void Calculation(IList<CropProduction> cropProductions, string token, CancellationToken ct)
        {
            foreach (CropProduction cropProduction in cropProductions)
            {
                CropProductionEntity cropProductionEntity = new CropProductionEntity(cropProduction);

                //IrrigationRequest irrigationMonitorResponse = IrrigationMonitor.ToIrrigate(cropProductionEntity);
            }
        }
    }
}
