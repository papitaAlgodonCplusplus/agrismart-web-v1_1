using Agrismart.Agronomic.UI.Services.Responses;
using Microsoft.AspNetCore.Components.Authorization;
using System.Security.Claims;

namespace Agrismart.Agronomic.UI.Authentication
{
    public class AgrismartAuthenticationStateProvider : AuthenticationStateProvider
    {

        private readonly AuthenticationDataMemoryStorage _authenticationDataMemoryStorage;

        public AgrismartAuthenticationStateProvider(AuthenticationDataMemoryStorage authenticationDataMemoryStorage)
        {
            _authenticationDataMemoryStorage = authenticationDataMemoryStorage;          
        }

        public async Task UpdateAuthenticationState(LoginResponse loginResponse)
        {
           var principal = new ClaimsPrincipal();
            
            if (loginResponse is not null)
            {
                principal = Utils.CreateClaimsPrincipalFromToken(loginResponse.Token);
                PersistUserToBrowser(loginResponse);
            }

            NotifyAuthenticationStateChanged(Task.FromResult(new AuthenticationState(principal)));
        }

        public override async Task<AuthenticationState> GetAuthenticationStateAsync()
        {
            var principal = new ClaimsPrincipal();
            var token = _authenticationDataMemoryStorage.Token;

            if (token is not null)
            {
                principal = Utils.CreateClaimsPrincipalFromToken(token);
            }

            return await Task.FromResult(new AuthenticationState(principal));
        }

        private void PersistUserToBrowser(LoginResponse loginResponse)
        {
            _authenticationDataMemoryStorage.ClientId = loginResponse.ClientId;
            _authenticationDataMemoryStorage.Token = loginResponse.Token;
            _authenticationDataMemoryStorage.UserEmail = loginResponse.UserName;
        }

        public void ClearBrowserUserData()
        {
            _authenticationDataMemoryStorage.ClientId = 0;
            _authenticationDataMemoryStorage.Token = "";
        }
    }
}
