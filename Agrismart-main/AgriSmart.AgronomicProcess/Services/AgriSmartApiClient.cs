using AgriSmart.AgronomicProcess.Configuration;
using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;
using AgriSmart.AgronomicProcess.Services.Responses;
using AgriSmart.Calculator.Services.Responses;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;

namespace AgriSmart.AgronomicProcess.Services
{
    public class AgriSmartApiClient : IDisposable, IAgriSmartApiClient
    {
        private readonly ILogger _logger;
        private readonly AgrismartApiConfiguration _agrismartApiConfiguration;
        private string _token = string.Empty;
        private readonly HttpClient _httpClient;

        private bool _disposedValue;

        public AgriSmartApiClient(HttpClient httpClient, ILogger<AgriSmartApiClient> logger, IOptions<AgrismartApiConfiguration> options)
        {
            _logger = logger;
            _agrismartApiConfiguration = options.Value;
            _httpClient = httpClient;
        }

        private void SetAuthHeader(string token)
        {
            //_httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        private void SetAuthHeaderPost(string token)
        {
            _httpClient.DefaultRequestHeaders.Accept.Clear();
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("text/plain"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        }
        public async Task<LoginResponse> CreateSession(string userName, string password)
        {
            try
            {
                var LoginCommand = new
                {
                    UserEmail = userName,
                    Password = password
                };

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonLoginCommand = JsonSerializer.Serialize(LoginCommand);
                var stringContent = new StringContent(jsonLoginCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.AuthenticationUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<LoginResponse> apiResponse = JsonSerializer.Deserialize<Response<LoginResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result;
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
        public async Task<IList<CalculationSetting>> GetCalculationSettings(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCalculationSettingsUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllCalculationSettingsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCalculationSettingsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    if (apiResponse.Success)
                    {
                        return (IList<CalculationSetting>)apiResponse.Result.CalculationSettings;
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
        public async Task<IList<Company>> GetCompanies(string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCompaniesUrl);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllCompaniesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCompaniesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<Company>)apiResponse.Result.Companies;
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
        public async Task<IList<Farm>> GetFarms(int companyId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetFarmsUrl + "?CompanyId=" + companyId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllFarmsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllFarmsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<Farm>)apiResponse.Result.Farms;
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
        public async Task<IList<ProductionUnit>> GetProductionUnits(int farmId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetProductionUnitsUrl + "?FarmId=" + farmId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllProductionUnitsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllProductionUnitsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<ProductionUnit>)apiResponse.Result.ProductionUnits;
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
        public async Task<IList<CropProduction>> GetCropProductions(int productionUnitId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCropProductionsUrl + "?ProductionUnitId=" + productionUnitId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllCropProductionsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCropProductionsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return (IList<CropProduction>)apiResponse.Result.CropProductions;
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
        public async Task<IList<Device>> GetDevices(int cropProductionId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetDevicesUrl + "?CropProductionId=" + cropProductionId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllDevicesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllDevicesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<Device>)apiResponse.Result.Devices;
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
        public async Task<ProcessDeviceRawDataMeasurementsResponse> ProcessDeviceRawData(int deviceId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var ProcessDeviceRawDataClimateMeasurementsCommand = new
                {
                    DeviceId = deviceId
                };

                var jsonProcessDeviceRawDataClimateMeasurementsCommand = JsonSerializer.Serialize(ProcessDeviceRawDataClimateMeasurementsCommand);
                var stringContent = new StringContent(jsonProcessDeviceRawDataClimateMeasurementsCommand, Encoding.UTF8, "application/json");

                using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(10)); // Custom 2-min timeout

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.ProcessDeviceRawDataMeasurementsUrl, stringContent, cts.Token);

                if (response.IsSuccessStatusCode)
                {
                    Response<ProcessDeviceRawDataMeasurementsResponse> apiResponse = JsonSerializer.Deserialize<Response<ProcessDeviceRawDataMeasurementsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result;
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
        public async Task<ProcessCropProductionRawDataMeasurementsResponse> ProcessCropProductionRawData(int cropProductionId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var ProcessCropProductionRawDataClimateMeasurementsCommand = new
                {
                    CropProductionId = cropProductionId
                };

                var jsonProcessCropProductionRawDataClimateMeasurementsCommand = JsonSerializer.Serialize(ProcessCropProductionRawDataClimateMeasurementsCommand);
                var stringContent = new StringContent(jsonProcessCropProductionRawDataClimateMeasurementsCommand, Encoding.UTF8, "application/json");

                using var cts = new CancellationTokenSource(TimeSpan.FromMinutes(10)); // Custom 2-min timeout

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.ProcessCropProductionRawDataMeasurementsUrl, stringContent, cts.Token);

                if (response.IsSuccessStatusCode)
                {
                    Response<ProcessCropProductionRawDataMeasurementsResponse> apiResponse = JsonSerializer.Deserialize<Response<ProcessCropProductionRawDataMeasurementsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result;
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
        public async Task<IList<Crop>> GetCrops(int productionUnitId, string token)
        {
            try
            {
                SetAuthHeader(token);

                using (var client = new HttpClient())
                {
                    var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCropsUrl);

                    if (response.IsSuccessStatusCode)
                    {
                        Response<GetAllCropsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCropsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (apiResponse.Success)
                        {
                            return (IList<Crop>)apiResponse.Result.Crops;
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
        public async Task<Crop> GetCrop(int cropId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCropUrl + "/" + cropId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetCropResponse> apiResponse = JsonSerializer.Deserialize<Response<GetCropResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (Crop)apiResponse.Result.Crop;
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
        public async Task<Container> GetContainer(int containerId, string token)    
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetContainerUrl + "/" + containerId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetContainerResponse> apiResponse = JsonSerializer.Deserialize<Response<GetContainerResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (Container)apiResponse.Result.Container;
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
        public async Task<Dropper> GetDropper(int dropperId, string token)
        {
            try
            {
                SetAuthHeader(token);

                using (var client = new HttpClient())
                {
                    var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetDropperUrl + "/" + dropperId.ToString());

                    if (response.IsSuccessStatusCode)
                    {
                        Response<GetDropperResponse> apiResponse = JsonSerializer.Deserialize<Response<GetDropperResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (apiResponse.Success)
                        {
                            return (Dropper)apiResponse.Result.Dropper;
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
        public async Task<GrowingMedium> GetGrowingMedium(int growingMediumId , string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetGrowingMediumUrl + "/" + growingMediumId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetGrowingMediumResponse> apiResponse = JsonSerializer.Deserialize<Response<GetGrowingMediumResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (GrowingMedium)apiResponse.Result.GrowingMedium;
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
        public async Task<MeasurementKPI> GetLastMeasurementKPI(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, string token)
        {
            try
            {
                SetAuthHeader(token);

                string url = "?CropProductionId=" + cropProductionId.ToString() + "&PeriodStartingDate =" + encodedStartingDateTime + "&PeriodEndingDate= " + encodedEndingDateTime;

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetMeasurementKPILatestUrl + url);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetLatestMeasurementKPIsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetLatestMeasurementKPIsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (MeasurementKPI)apiResponse.Result.LatestMeasurementKPIs;
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
        public async Task<IList<MeasurementKPI>> GetMeasurementKPIs(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, string token)
        {
            try
            {
                SetAuthHeader(token);

                string url = "?CropProductionId=" + cropProductionId.ToString() + "&PeriodStartingDate =" + encodedStartingDateTime + "&PeriodEndingDate= " + encodedEndingDateTime;

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetMeasurementsKPIUrl + url);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetLatestMeasurementKPIsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetLatestMeasurementKPIsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<MeasurementKPI>)apiResponse.Result.LatestMeasurementKPIs;
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
        public async Task<IList<MeasurementVariable>> GetMeasurementVariables(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetMeasurementVariablesUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllMeasurementVariablesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllMeasurementVariablesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<MeasurementVariable>)apiResponse.Result.MeasurementVariables;
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
        public async Task<IList<Measurement>> GetMeasurements(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, int measurementVariableId, string token)
        {
            try
            {
                SetAuthHeader(token);

                string url = "?CropProductionId=" + cropProductionId.ToString() + "&MeasurementVariableId=" + measurementVariableId.ToString() + "&PeriodStartingDate=" + encodedStartingDateTime + "&PeriodEndingDate=" + encodedEndingDateTime;

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetMeasurementsUrl + url);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllMeasurementsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllMeasurementsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<Measurement>)apiResponse.Result.Measurements;
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
        public async Task<IList<MeasurementBase>> GetMeasurementsBase(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, int measurementVariableId, string token)
        {
            try
            {
                SetAuthHeader(token);

                string url = "?CropProductionId=" + cropProductionId.ToString() + "&MeasurementVariableId=" + measurementVariableId.ToString() + "&PeriodStartingDate=" + encodedStartingDateTime + "&PeriodEndingDate=" + encodedEndingDateTime;

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetMeasurementsBaseUrl + url);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllMeasurementsBaseResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllMeasurementsBaseResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<MeasurementBase>)apiResponse.Result.Measurements;
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
        public async Task<IList<IrrigationMeasurement>> GetIrrigationMeasurements(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId , string token)
        {
            try
            {
                SetAuthHeader(token);

                string url = "?CropProductionId=" + cropProductionId.ToString() + "&StartingDateTime=" + encodedStartingDateTime + "&EndingDateTime=" + encodedEndingDateTime;

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetIrrigationMeasurementUrl + url);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllIrrigationMeasurementsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllIrrigationMeasurementsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<IrrigationMeasurement>)apiResponse.Result.IrrigationMeasurements;
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
        public async Task<IList<IrrigationEvent>> GetIrrigationEvents(string encodedStartingDateTime, string encodedEndingDateTime, int cropProductionId, string token)
        {
            try
            {
                SetAuthHeader(token);

                string url = "?CropProductionId=" + cropProductionId.ToString() + "&StartingDateTime=" + encodedStartingDateTime + "&EndingDateTime=" + encodedEndingDateTime;

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetIrrigationEventsUrl + url);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllIrrigationEventsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllIrrigationEventsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<IrrigationEvent>)apiResponse.Result.IrrigationEvents;
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
        public async Task<IList<TimeZone>> GetTimeZones(string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetTimeZonesUrl);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllTimeZonesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllTimeZonesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return (IList<TimeZone>)apiResponse.Result.TimeZones;
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
        public async Task<TimeZone> GetTimeZone(int timeZoneId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetTimeZonesUrl + "/" + timeZoneId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetTimeZoneResponse> apiResponse = JsonSerializer.Deserialize<Response<GetTimeZoneResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.TimeZone;
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
