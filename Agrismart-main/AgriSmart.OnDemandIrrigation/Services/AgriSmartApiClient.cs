using AgriSmart.OnDemandIrrigation.Configuration;
using AgriSmart.OnDemandIrrigation.Services.Responses;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services
{
    public class AgriSmartApiClient : IDisposable
    {
        private readonly ILogger _logger;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private string _token = string.Empty;

        private bool _disposedValue;

        public AgriSmartApiClient(string token, ILogger logger, AgrismartApiConfiguration agrismartApiConfiguration)
        {
            _token = token;
            _logger = logger;
            _agrismartApiConfiguration = agrismartApiConfiguration;
        }
        public async Task<LoginResponse?> CreateSession(string userName, string password)
        {
            try
            {
                var LoginCommand = new
                {
                    UserEmail = userName,
                    Password = password
                };
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        var jsonLoginCommand = JsonSerializer.Serialize(LoginCommand);
                        var stringContent = new StringContent(jsonLoginCommand, Encoding.UTF8, "application/json");

                        var response = await client.PostAsync(_agrismartApiConfiguration.AuthenticationUrl, stringContent);

                        if (response.IsSuccessStatusCode)
                        {
                            Response<LoginResponse>? apiResponse = JsonSerializer.Deserialize<Response<LoginResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return apiResponse.Result!;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<Client>?> GetClients()
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetClientsUrl);

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllClientsResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllClientsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<Client>)apiResponse.Result!.Companies;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<Company>?> GetCompanies()
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetCompaniesUrl);

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllCompaniesResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllCompaniesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<Company>)apiResponse.Result!.Companies;
                            }                           
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<Farm>?> GetFarms(int companyId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetFarmsUrl + "?CompanyId=" + companyId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllFarmsResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllFarmsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<Farm>)apiResponse.Result!.Farms;
                            }

                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<ProductionUnit>?> GetProductionUnits(int farmId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetProductionUnitsUrl + "?FarmId=" + farmId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllProductionUnitsResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllProductionUnitsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<ProductionUnit>)apiResponse.Result!.ProductionUnits;
                            }

                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<CropProduction>?> GetCropProductions(int productionUnitId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetCropProductionsUrl + "?ProductionUnitId=" + productionUnitId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllCropProductionsResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllCropProductionsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<CropProduction>)apiResponse.Result!.CropProductions;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<Crop>?> GetCrops(int productionUnitId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetCropsUrl);

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllCropsResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllCropsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<Crop>)apiResponse.Result!.Crops;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<Crop?> GetCrop(int cropId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetCropUrl +"/" + cropId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetCropResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetCropResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (Crop)apiResponse.Result!.Crop;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        //public async Task<IList<Device>> GetDevices(int cropProductionId)
        //{
        //    try
        //    {
        //        using (var client = new HttpClient())
        //        {
        //            if (_agrismartApiConfiguration.BaseAddress != null)
        //            {
        //                client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
        //                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

        //                var response = await client.GetAsync(_agrismartApiConfiguration.GetDevicesUrl + "?CropProductionId=" + cropProductionId.ToString());

        //                if (response.IsSuccessStatusCode)
        //                {
        //                    Response<GetAllDevicesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllDevicesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        //                    if (apiResponse.Success)
        //                    {
        //                        return (IList<Device>)apiResponse.Result.Devices;
        //                    }
        //                }
        //            }
        //        }
        //        return null;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex.Message);
        //        return null;
        //    }
        //}
        //public async Task<IList<Device>> ProcessDeviceRawDataClimateMeasurements(int deviceId)
        //{
        //    try
        //    {
        //        var ProcessDeviceRawDataClimateMeasurementsCommand = new
        //        {
        //            DeviceId = deviceId
        //        };

        //        using (var client = new HttpClient())
        //        {
        //            if (_agrismartApiConfiguration.BaseAddress != null)
        //            {
        //                client.Timeout = TimeSpan.FromMinutes(10);
        //                client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
        //                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

        //                var jsonProcessDeviceRawDataClimateMeasurementsCommand = JsonSerializer.Serialize(ProcessDeviceRawDataClimateMeasurementsCommand);
        //                var stringContent = new StringContent(jsonProcessDeviceRawDataClimateMeasurementsCommand, Encoding.UTF8, "application/json");

        //                var response = await client.PostAsync(_agrismartApiConfiguration.ProcessDeviceRawDataClimateMeasurementsUrl, stringContent);

        //                if (response.IsSuccessStatusCode)
        //                {
        //                    var processDeviceRawDataClimateMeasurementsResult = response.Content.ReadAsStringAsync();
                           
        //                    return null;
        //                }
        //            }
        //        }
        //        return null;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex.Message);
        //        return null;
        //    }
        //}
        public async Task<IList<MeasurementVariableStandard>?> GetMeasurementVariablesStandard()
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetMeasurementVariableStandardUrl);

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllMeasurementVariablesStandardResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllMeasurementVariablesStandardResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<MeasurementVariableStandard>)apiResponse.Result!.MeasurementVariablesStandard;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<MeasurementVariable>?> GetMeasurementVariables(int catalogId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetMeasurementVariablesUrl + "?CatalogId=" + catalogId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllMeasurementVariablesResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllMeasurementVariablesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<MeasurementVariable>)apiResponse.Result!.MeasurementVariables;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<IList<Measurement>?> GetMeasurements(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, int measurementVariableId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        string url = "?CropProductionId=" + cropProductionId.ToString() + "&MeasurementVariableId=" + measurementVariableId.ToString() + "&PeriodStartingDate=" + encodedStartingDateTime + "&PeriodEndingDate=" + encodedEndingDateTime;

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetMeasurementUrl + url);

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetAllMeasurementsResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetAllMeasurementsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (IList<Measurement>)apiResponse.Result!.Measurements;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        //public async Task<IList<IrrigationEvent>> GetIrrigationEvents(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId)
        //{
        //    try
        //    {
        //        using (var client = new HttpClient())
        //        {
        //            if (_agrismartApiConfiguration.BaseAddress != null)
        //            {
        //                client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
        //                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

        //                string url = "?CropProductionId=" + cropProductionId.ToString() + "&StartingDateTime=" + encodedStartingDateTime + "&EndingDateTime=" + encodedEndingDateTime;

        //                var response = await client.GetAsync(_agrismartApiConfiguration.GetIrrigationEventsUrl + url);

        //                if (response.IsSuccessStatusCode)
        //                {
        //                    Response<GetAllIrrigationEventsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllIrrigationEventsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        //                    if (apiResponse.Success)
        //                    {
        //                        return (IList<IrrigationEvent>)apiResponse.Result.IrrigationEvents;
        //                    }
        //                }
        //            }
        //        }
        //        return null;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex.Message);
        //        return null;
        //    }
        //}
        //public async Task<IList<IrrigationMeasurement>> GetIrrigationMeasurements(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId)
        //{
        //    try
        //    {
        //        using (var client = new HttpClient())
        //        {
        //            if (_agrismartApiConfiguration.BaseAddress != null)
        //            {
        //                client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
        //                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

        //                string url = "?CropProductionId=" + cropProductionId.ToString() + "&StartingDateTime=" + encodedStartingDateTime + "&EndingDateTime=" + encodedEndingDateTime;

        //                var response = await client.GetAsync(_agrismartApiConfiguration.GetIrrigationMeasurementUrl + url);

        //                if (response.IsSuccessStatusCode)
        //                {
        //                    Response<GetAllIrrigationMeasurementsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllIrrigationMeasurementsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        //                    if (apiResponse.Success)
        //                    {
        //                        return (IList<IrrigationMeasurement>)apiResponse.Result.IrrigationMeasurements;
        //                    }
        //                }
        //            }
        //        }
        //        return null;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex.Message);
        //        return null;
        //    }
        //}
        //public async Task<MeasurementKPI> GetLastMeasurementKPI(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId)
        //{
        //    try
        //    {
        //        using (var client = new HttpClient())
        //        {
        //            if (_agrismartApiConfiguration.BaseAddress != null)
        //            {
        //                client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
        //                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

        //                string url = "?CropProductionId=" + cropProductionId.ToString() + "&PeriodStartingDate =" + encodedStartingDateTime + "&PeriodEndingDate= " + encodedEndingDateTime;

        //                var response = await client.GetAsync(_agrismartApiConfiguration.GetMeasurementKPILatestUrl + url);

        //                if (response.IsSuccessStatusCode)
        //                {
        //                    Response<GetLatestMeasurementKPIsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetLatestMeasurementKPIsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        //                    if (apiResponse.Success)
        //                    {
        //                        return (MeasurementKPI)apiResponse.Result.LatestMeasurementKPIs;
        //                    }
        //                }
        //            }
        //        }
        //        return null;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex.Message);
        //        return null;
        //    }
        //}
        public async Task<Container?> GetContainer(int containerId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetContainerUrl + "/" + containerId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetContainerResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetContainerResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (Container)apiResponse.Result!.Container;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        //public async Task<IList<MeasurementKPI>> GetMeasurementKPIs(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId)
        //{
        //    try
        //    {
        //        using (var client = new HttpClient())
        //        {
        //            if (_agrismartApiConfiguration.BaseAddress != null)
        //            {
        //                client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
        //                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

        //                string url = "?CropProductionId=" + cropProductionId.ToString() + "&PeriodStartingDate =" + encodedStartingDateTime + "&PeriodEndingDate= " + encodedEndingDateTime;

        //                var response = await client.GetAsync(_agrismartApiConfiguration.GetMeasurementsKPIUrl + url);

        //                if (response.IsSuccessStatusCode)
        //                {
        //                    Response<GetLatestMeasurementKPIsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetLatestMeasurementKPIsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        //                    if (apiResponse.Success)
        //                    {
        //                        return (IList<MeasurementKPI>)apiResponse.Result.LatestMeasurementKPIs;
        //                    }
        //                }
        //            }
        //        }
        //        return null;
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex.Message);
        //        return null;
        //    }
        //}
        public async Task<Dropper?> GetDropper(int dropperId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetContainerUrl + dropperId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetDropperResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetDropperResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (Dropper)apiResponse.Result!.Dropper;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<GrowingMedium?> GetGrowingMedium(int growingMediumId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetGrowingMediumUrl + "/" + growingMediumId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetGrowingMediumResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetGrowingMediumResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (GrowingMedium)apiResponse.Result!.GrowingMedium;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }
        public async Task<CropProductionIrrigationSector?> GetCropProductionIrrigationSector(int cropProduductionIrrigationSectorId)
        {
            try
            {
                using (var client = new HttpClient())
                {
                    if (_agrismartApiConfiguration.BaseAddress != null)
                    {
                        client.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _token);

                        var response = await client.GetAsync(_agrismartApiConfiguration.GetCropProductionIrrigationSectorUrl + cropProduductionIrrigationSectorId.ToString());

                        if (response.IsSuccessStatusCode)
                        {
                            Response<GetCropProductionIrrigationSectorResponse>? apiResponse = JsonSerializer.Deserialize<Response<GetCropProductionIrrigationSectorResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                            if (apiResponse?.Success == true)
                            {
                                return (CropProductionIrrigationSector)apiResponse.Result!.CropProductionIrrigationSector;
                            }
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
                return null;
            }
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposedValue)
            {
                if (disposing)
                {
                    // TODO: dispose managed state (managed objects)
                }

                // TODO: free unmanaged resources (unmanaged objects) and override finalizer
                // TODO: set large fields to null
                _disposedValue = true;
            }
        }

        // // TODO: override finalizer only if 'Dispose(bool disposing)' has code to free unmanaged resources
        // ~AgriSmartApiClient()
        // {
        //     // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
        //     Dispose(disposing: false);
        // }

        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
