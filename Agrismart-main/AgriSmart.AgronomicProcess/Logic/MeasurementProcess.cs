using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Services;
using AgriSmart.AgronomicProcess.Services.Responses;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class MeasurementProcess
    {
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private readonly IAgriSmartApiClient _agriSmartApiClient;
        private readonly ILogger _logger;
        private string _token = string.Empty;

        public MeasurementProcess(string token, ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration, IAgriSmartApiClient agriSmartApiClient)
        {
            _token = token;
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
            _agriSmartApiClient = agriSmartApiClient;   
        }

        public async Task<ProcessDeviceRawDataMeasurementsResponse> CalculateMeasurements(IList<Device> devices, string token, CancellationToken ct)
        {
            foreach (Device device in devices)
            {
                if (ct.IsCancellationRequested)
                    return null;

                var a = await _agriSmartApiClient.ProcessDeviceRawData(device.Id, token);
            }

            return null;
        }

        public async Task<ProcessCropProductionRawDataMeasurementsResponse> CalculateMeasurements(IList<CropProduction> cropProductions, string token, CancellationToken ct)
        {
            foreach (CropProduction cropProduction in cropProductions)
            {
                if (ct.IsCancellationRequested)
                    return null;

                var a = await _agriSmartApiClient.ProcessCropProductionRawData(cropProduction.Id, token);
            }

            return null;
        }
    }
}
