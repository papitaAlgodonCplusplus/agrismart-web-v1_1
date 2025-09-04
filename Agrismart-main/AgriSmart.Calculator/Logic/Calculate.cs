using AgriSmart.Calculator.Configuration;
using AgriSmart.Calculator.Entities;
using AgriSmart.Calculator.Models;
using AgriSmart.Calculator.Services;
using Microsoft.Extensions.Logging;

namespace AgriSmart.Calculator.Logic
{
    public class Calculate
    {
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public Calculate(string token, ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration)
        {
            _token = token;
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
        }

        public void CalculateClimateMeasurements(IList<CropProduction> cropProductions)
        {
            foreach (CropProduction cropProduction in cropProductions)
            {
                List<GlobalOutput> outputs = new List<GlobalOutput>();

                using (AgriSmartApiClient agriSmartApiClient = new(_token, _logger, _agrismartApiConfiguration))
                {
                    //var a = agriSmartApiClient.ProcessDeviceRawDataClimateMeasurements(device.Id).Result;
                }
            }
        }
    }
}
