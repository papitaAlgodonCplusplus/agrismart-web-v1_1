using Agrismart.Agronomic.UI.Authentication;
using Agrismart.Agronomic.UI.Configuration;
using Agrismart.Agronomic.UI.Services.Interfaces;
using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;
using Microsoft.Extensions.Options;
using System.Text.Json;
using System.Web;

namespace Agrismart.Agronomic.UI.Services

{
    public class CropProductionIrrigationSectorService : BaseService, ICropProductionIrrigationSectorService
    { 
        public CropProductionIrrigationSectorService(IHttpClientFactory httpClientFactory, IOptions<AgriSmartApiConfiguration> options, AuthenticationDataMemoryStorage authenticationDataMemoryStorage) : base(httpClientFactory, options, authenticationDataMemoryStorage) { }

        public async Task<GetAllCropProductionIrrigationSectorsResponse> GetAll(GetAllCropProductionIrrigationSectorsRequest request)
        {
            try
            {
                var properties = from p in request.GetType().GetProperties()
                                 where p.GetValue(request, null) != null
                                 select p.Name + "=" + HttpUtility.UrlEncode(p.GetValue(request, null).ToString());


                var httpResponseMessage = await MakeHttpCall("Get", _agriSmartApiConfiguration.CropProductionIrrigationSectorEndpoint, null, String.Join("&", properties.ToArray()));
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<GetAllCropProductionIrrigationSectorsResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCropProductionIrrigationSectorsResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result;
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<CropProductionIrrigationSectorResponse> Create(CreateCropProductionIrrigationSectorRequest request)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(request);
                var httpResponseMessage = await MakeHttpCall("Post", _agriSmartApiConfiguration.CropProductionIrrigationSectorEndpoint, jsonString, null);
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<CropProductionIrrigationSectorResponse> apiResponse = JsonSerializer.Deserialize<Response<CropProductionIrrigationSectorResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result;
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }

        public async Task<CropProductionIrrigationSectorResponse> Update(UpdateCropProductionIrrigationSectorRequest request)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(request);
                var httpResponseMessage = await MakeHttpCall("Put", _agriSmartApiConfiguration.CropProductionIrrigationSectorEndpoint, jsonString, null);
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<CropProductionIrrigationSectorResponse> apiResponse = JsonSerializer.Deserialize<Response<CropProductionIrrigationSectorResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                    if (apiResponse.Success)
                    {
                        return apiResponse.Result;
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
