using AgriSmart.Core.Entities;
using AgriSmart.OnDemandIrrigation.Configuration;
using Microsoft.Extensions.Logging;

namespace AgriSmart.OnDemandIrrigation.Logic
{
    public class OnDemandIrrigation
    {
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public OnDemandIrrigation(AgrismartApiConfiguration agrismartApiConfiguration, ILogger logger, string token)
        {
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _logger = logger;
            _token = token;
        }


        List<CropProduction> cropProductions;


        //public OnDemandIrrigation(List<CropProduction> cropProductions)
        //{
        //    this.cropProductions = cropProductions;
        //}

        public void Run(List<CropProduction> cropProductions)
        {
            List<IrrigationRequest> irrigationRequests = new List<IrrigationRequest>();

            foreach (CropProduction cropProduction in cropProductions)
            {
                IrrigationMonitorResponse irrigationMonitorResponse = IrrigationMonitor.ToIrrigate(cropProduction);

                if (irrigationMonitorResponse.Irrigate)
                {
                    foreach (CropProductionIrrigationSector irrigationSector in cropProduction.IrrigationSector)
                    {
                        irrigationRequests.Add(new IrrigationRequest(irrigationSector, irrigationMonitorResponse.IrrigationTime));
                    }
                }

                if (irrigationRequests.Count > 0)
                {
                    IrrigationController irrigationController = new IrrigationController(irrigationRequests);
                    irrigationController.StartIrrigation();
                }
            }

        }
    }
}
