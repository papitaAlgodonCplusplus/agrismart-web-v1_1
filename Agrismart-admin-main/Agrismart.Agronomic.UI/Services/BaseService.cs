using Agrismart.Agronomic.UI.Authentication;
using Agrismart.Agronomic.UI.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Net.Http.Headers;
using System.Text;

namespace Agrismart.Agronomic.UI.Services
{
    public class BaseService
    {
        private readonly IHttpClientFactory _httpClientFactory;
        protected readonly AgriSmartApiConfiguration _agriSmartApiConfiguration;
        private readonly AuthenticationDataMemoryStorage _authenticationDataMemoryStorage;

        public BaseService(IHttpClientFactory httpClientFactory, IOptions<AgriSmartApiConfiguration> options, AuthenticationDataMemoryStorage authenticationDataMemoryStorage)
        {
            _httpClientFactory = httpClientFactory;
            _agriSmartApiConfiguration = options.Value;
            _authenticationDataMemoryStorage = authenticationDataMemoryStorage;
        }

        protected async Task<HttpResponseMessage> MakeHttpCall(string method, string endPoint, string requestBody, string parameters)
        {
            try
            {
                //parameters = HttpUtility.UrlEncode(parameters);

                string urlString = (method == "Post" || method == "Delete") ? _agriSmartApiConfiguration.BaseUrl + endPoint : _agriSmartApiConfiguration.BaseUrl + endPoint + "?" + parameters;
                var requestMessage = new HttpRequestMessage()
                {
                    Method = new HttpMethod(method),
                    RequestUri = new Uri(urlString),
                    Content = string.IsNullOrEmpty(requestBody) ? null : new StringContent(requestBody, Encoding.UTF8, "application/json")
                };

                var httpClient = _httpClientFactory.CreateClient();

                if (!_authenticationDataMemoryStorage.Token.IsNullOrEmpty()) httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _authenticationDataMemoryStorage.Token);

                return await httpClient.SendAsync(requestMessage);

            }
            catch (Exception ex)
            {
                return new HttpResponseMessage(HttpStatusCode.InternalServerError);
            }
        }
    }
}
