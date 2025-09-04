using AgriSmart.AgronomicProcess.Models;
using AgriSmart.Tools.Configuration;
using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Services.Responses;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Services
{
    public class AgriSmartApiClient : IDisposable, IAgriSmartApiClient
    {
        private readonly Microsoft.Extensions.Logging.ILogger _logger;
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
        public async Task<UserModel> CreateSession(string userName, string password)
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
                    Response<UserModel> apiResponse = JsonSerializer.Deserialize<Response<UserModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
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
        public async Task<IList<CalculationSettingModel>> GetCalculationSettings(int catalogId, string token)
        {
            return null;
        }
        private async Task<List<CalculationSettingModel>> DownLoadCalculationSettings(int catalogId, string token)
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
                        return apiResponse.Result.CalculationSettings;
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
        private async Task<List<CompanyModel>> DownLoadCompanies(string token)
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
                        return apiResponse.Result.Companies;
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
        public async Task<IList<CompanyModel>> GetCompanies(string token)
        {
            List<CompanyModel> items = await DownLoadCompanies(token);
            return items;
        }
        public async Task<List<FarmModel>> GetFarms(int companyId, string token)
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
                        return apiResponse.Result.Farms;
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
        public async Task<List<ProductionUnitModel>> GetProductionUnits(int farmId, string token)
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
                        return apiResponse.Result.ProductionUnits;
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
        public async Task<List<CropProductionModel>> GetCropProductions(int productionUnitId, string token)
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
                        return apiResponse.Result.CropProductions;
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
        public async Task<List<CropProductionModel>> GetCropProductionsByCompany(int companyId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCropProductionsUrl + "?CompanyId=" + companyId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllCropProductionsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCropProductionsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.CropProductions;
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

        public async Task<List<CropModel>> GetCrops(string token)
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
                            return apiResponse.Result.Crops;
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
        public async Task<List<CropPhaseModel>> GetCropPhases(int cropId, string token)
        {
            try
            {
                SetAuthHeader(token);

                using (var client = new HttpClient())
                {
                    var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCropPhasesUrl + "?CropId=" + cropId.ToString());

                    if (response.IsSuccessStatusCode)
                    {
                        Response<GetAllCropPhasesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCropPhasesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (apiResponse.Success)
                        {
                            return apiResponse.Result.CropPhases;
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
        public async Task<List<FertilizerInputModel>> GetFertilizerInputs(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetFertilizerInputsUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllFertilizerInputsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllFertilizerInputsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.FertilizerInputs;
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
        public async Task<List<FertilizerModel>> GetFertilizers(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetFertilizersUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllFertilizersResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllFertilizersResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.Fertilizers;
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
        public async Task<List<FertilizerChemistryModel>> GetFertilizerChemitries(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetFertilizerChemitriessUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllFertilizerChemitriesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllFertilizerChemitriesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.FertilizerChemistries;
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
        public async Task<List<WaterModel>> GetWaters(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetWatersUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllWaterResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllWaterResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.Waters;
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
        public async Task<List<WaterChemistryModel>> GetWaterChemistries(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetWaterChemistriesUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllWaterChemistriesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllWaterChemistriesResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.WaterChemistries;
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
        public async Task<List<InputPresentationModel>> GetInputPresentations(int catalogId, string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetInputPresentationsUrl + "?CatalogId=" + catalogId.ToString());

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllInputPresentationsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllInputPresentationsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.InputPresentations;
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
        public async Task<List<MeasurementUnitModel>> GetMeasurementUnits(string token)
        {
            try
            {
                SetAuthHeader(token);

                var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetMeasurementUnitsUrl);

                if (response.IsSuccessStatusCode)
                {
                    Response<GetAllMeasurementUnitsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllMeasurementUnitsResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result.MeasurementUnits;
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
        public async Task<CropPhaseSolutionRequirementModel> GetCropPhaseSolutionRequirement(int cropPhaseId, string token)
        {
            try
            {
                SetAuthHeader(token);

                using (var client = new HttpClient())
                {
                    var response = await _httpClient.GetAsync(_agrismartApiConfiguration.GetCropPhaseSolutionRequirementUrl + "?PhaseId=" + cropPhaseId.ToString());

                    if (response.IsSuccessStatusCode)
                    {
                        Response<GetCropPhaseSolutionRequirementResponse> apiResponse = JsonSerializer.Deserialize<Response<GetCropPhaseSolutionRequirementResponse>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (apiResponse.Success)
                        {
                            return apiResponse.Result.CropPhaseSolutionRequirement;
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
        public async Task<CropModel> GetCrop(int cropId, string token)
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
                        return (CropModel)apiResponse.Result.Crop;
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
        public async Task<ContainerModel> GetContainer(int containerId, string token)    
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
                        return (ContainerModel)apiResponse.Result.Container;
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
        public async Task<DropperModel> GetDropper(int dropperId, string token)
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
                            return (DropperModel)apiResponse.Result.Dropper;
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
        public async Task<GrowingMediumModel> GetGrowingMedium(int growingMediumId , string token)
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
                        return (GrowingMediumModel)apiResponse.Result.GrowingMedium;
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
        public async Task<Response<FertilizerModel>> PostFertilizerAsync(FertilizerModel fertilizeryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(fertilizeryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PostFertilizerUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<FertilizerModel> apiResponse = JsonSerializer.Deserialize<Response<FertilizerModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception e)
            {
                return new Response<FertilizerModel>(e.Message);
            }
        }
        public async Task<Response<FertilizerModel>> PutFertilizerAsync(FertilizerModel fertilizeryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(fertilizeryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PutAsync(_agrismartApiConfiguration.PutFertilizerUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<FertilizerModel> apiResponse = JsonSerializer.Deserialize<Response<FertilizerModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception e)
            {
                return new Response<FertilizerModel>(e.Message);
            }
        }
        public async Task<Response<FertilizerChemistryModel>> PostFertilizerChemistryAsync(FertilizerChemistryModel fertilizerChemistryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(fertilizerChemistryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PostFertilizerChemistryUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<FertilizerChemistryModel> apiResponse = JsonSerializer.Deserialize<Response<FertilizerChemistryModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    
                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception e)
            {
                return new Response<FertilizerChemistryModel>(e.Message);
            }
        }
        public async Task<Response<FertilizerChemistryModel>> PutFertilizerChemistryAsync(FertilizerChemistryModel fertilizerChemistryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(fertilizerChemistryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PutAsync(_agrismartApiConfiguration.PutFertilizerChemistryUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<FertilizerChemistryModel> apiResponse = JsonSerializer.Deserialize<Response<FertilizerChemistryModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception e)
            {
                return new Response<FertilizerChemistryModel>(e.Message);
            }
        }
        public async Task<Response<WaterModel>> PostWaterAsync(WaterModel waterChemistryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(waterChemistryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PostWaterUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<WaterModel> apiResponse = JsonSerializer.Deserialize<Response<WaterModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<WaterModel>(ex.Message);
            }
        }
        public async Task<Response<WaterModel>> PutWaterAsync(WaterModel waterChemistryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(waterChemistryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PutAsync(_agrismartApiConfiguration.PutWaterUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<WaterModel> apiResponse = JsonSerializer.Deserialize<Response<WaterModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<WaterModel>(ex.Message);
            }
        }
        public async Task<Response<WaterChemistryModel>> PostWaterChemistryAsync(WaterChemistryModel waterChemistryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(waterChemistryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PostWaterChemistryUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<WaterChemistryModel> apiResponse = JsonSerializer.Deserialize<Response<WaterChemistryModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<WaterChemistryModel>(ex.Message);
            }
        }
        public async Task<Response<WaterChemistryModel>> PutWaterChemistryAsync(WaterChemistryModel waterChemistryModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(waterChemistryModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PutWaterChemistryUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<WaterChemistryModel> apiResponse = JsonSerializer.Deserialize<Response<WaterChemistryModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<WaterChemistryModel>(ex.Message);
            }
        }
        public async Task<Response<InputPresentationModel>> PostInputPresentationAsync(InputPresentationModel inputPresentationModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(inputPresentationModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PostInputPresentationUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<InputPresentationModel> apiResponse = JsonSerializer.Deserialize<Response<InputPresentationModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<InputPresentationModel>(ex.Message);
            }
        }
        public async Task<Response<InputPresentationModel>> PutInputPresentationAsync(InputPresentationModel inputPresentationModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(inputPresentationModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PutInputPresentationUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<InputPresentationModel> apiResponse = JsonSerializer.Deserialize<Response<InputPresentationModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<InputPresentationModel>(ex.Message);
            }
        }
        public async Task<Response<FertilizerInputModel>> PostFertilizerInputAsync(FertilizerInputModel fertilizerInputModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(fertilizerInputModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PostFertilizerInputUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<FertilizerInputModel> apiResponse = JsonSerializer.Deserialize<Response<FertilizerInputModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<FertilizerInputModel>(ex.Message);
            }
        }
        public async Task<Response<FertilizerInputModel>> PutFertilizerInputAsync(FertilizerInputModel fertilizerInputModel, string token)
        {
            try
            {
                SetAuthHeader(token);

                _httpClient.BaseAddress = new Uri(_agrismartApiConfiguration.BaseAddress);
                var jsonCommand = JsonSerializer.Serialize(fertilizerInputModel);
                var stringContent = new StringContent(jsonCommand, Encoding.UTF8, "application/json");

                var response = await _httpClient.PostAsync(_agrismartApiConfiguration.PutFertilizerInputUrl, stringContent);

                if (response.IsSuccessStatusCode)
                {
                    Response<FertilizerInputModel> apiResponse = JsonSerializer.Deserialize<Response<FertilizerInputModel>>(await response.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    if (apiResponse.Success)
                    {
                        return apiResponse;
                    }
                }

                return null;
            }
            catch (Exception ex)
            {
                return new Response<FertilizerInputModel>(ex.Message);
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
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in 'Dispose(bool disposing)' method
            Dispose(disposing: true);
            GC.SuppressFinalize(this);
        }
    }
}
