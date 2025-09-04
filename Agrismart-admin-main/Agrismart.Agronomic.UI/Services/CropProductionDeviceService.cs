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
    public class CropProductionDeviceService : BaseService, ICropProductionDeviceService
    { 
        public CropProductionDeviceService(IHttpClientFactory httpClientFactory, IOptions<AgriSmartApiConfiguration> options, AuthenticationDataMemoryStorage authenticationDataMemoryStorage) : base(httpClientFactory, options, authenticationDataMemoryStorage) { }

        public async Task<GetAllCropProductionDevicesResponse> GetAll(GetAllCropProductionDevicesRequest request)
        {
            try
            {
                var properties = from p in request.GetType().GetProperties()
                                 where p.GetValue(request, null) != null
                                 select p.Name + "=" + HttpUtility.UrlEncode(p.GetValue(request, null).ToString());


                var httpResponseMessage = await MakeHttpCall("Get", _agriSmartApiConfiguration.CropProductionDeviceEndpoint, null, String.Join("&", properties.ToArray()));
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<GetAllCropProductionDevicesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllCropProductionDevicesResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
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

        public async Task<CropProductionDeviceResponse> Create(CreateCropProductionDeviceRequest request)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(request);
                var httpResponseMessage = await MakeHttpCall("Post", _agriSmartApiConfiguration.CropProductionDeviceEndpoint, jsonString, null);
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<CropProductionDeviceResponse> apiResponse = JsonSerializer.Deserialize<Response<CropProductionDeviceResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
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

        public async Task<CropProductionDeviceResponse> Delete(DeleteCropProductionDeviceRequest request)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(request);
                var httpResponseMessage = await MakeHttpCall("Delete", _agriSmartApiConfiguration.CropProductionDeviceEndpoint, jsonString, null);
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<CropProductionDeviceResponse> apiResponse = JsonSerializer.Deserialize<Response<CropProductionDeviceResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
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
