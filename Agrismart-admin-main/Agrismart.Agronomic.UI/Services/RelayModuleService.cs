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
    public class RelayModuleService : BaseService, IRelayModuleService
    { 
        public RelayModuleService(IHttpClientFactory httpClientFactory, IOptions<AgriSmartApiConfiguration> options, AuthenticationDataMemoryStorage authenticationDataMemoryStorage) : base(httpClientFactory, options, authenticationDataMemoryStorage) { }

        public async Task<GetAllRelayModulesResponse> GetAll(GetAllRelayModulesRequest request)
        {
            try
            {
                var properties = from p in request.GetType().GetProperties()
                                 where p.GetValue(request, null) != null
                                 select p.Name + "=" + HttpUtility.UrlEncode(p.GetValue(request, null).ToString());


                var httpResponseMessage = await MakeHttpCall("Get", _agriSmartApiConfiguration.RelayModuleEndpoint, null, String.Join("&", properties.ToArray()));
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<GetAllRelayModulesResponse> apiResponse = JsonSerializer.Deserialize<Response<GetAllRelayModulesResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
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

        public async Task<RelayModuleResponse> Create(CreateRelayModuleRequest request)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(request);
                var httpResponseMessage = await MakeHttpCall("Post", _agriSmartApiConfiguration.RelayModuleEndpoint, jsonString, null);
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<RelayModuleResponse> apiResponse = JsonSerializer.Deserialize<Response<RelayModuleResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
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

        public async Task<RelayModuleResponse> Update(UpdateRelayModuleRequest request)
        {
            try
            {
                string jsonString = JsonSerializer.Serialize(request);
                var httpResponseMessage = await MakeHttpCall("Put", _agriSmartApiConfiguration.RelayModuleEndpoint, jsonString, null);
                if (httpResponseMessage.IsSuccessStatusCode)
                {
                    Response<RelayModuleResponse> apiResponse = JsonSerializer.Deserialize<Response<RelayModuleResponse>>(await httpResponseMessage.Content.ReadAsStringAsync(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
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
