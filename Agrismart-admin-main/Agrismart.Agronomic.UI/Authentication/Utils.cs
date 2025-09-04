using Agrismart.Agronomic.UI.Services.Responses;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Agrismart.Agronomic.UI.Authentication
{
    public static class Utils
    {
        public static ClaimsPrincipal ToClaimsPrincipal(LoginResponse loginResponse) => new(new ClaimsIdentity(new Claim[]
        {
        new (ClaimTypes.Name, loginResponse.UserName),
        new (ClaimTypes.Hash, loginResponse.Token),
        new (nameof(loginResponse.Id), loginResponse.Id.ToString())
        }));


        public static ClaimsPrincipal CreateClaimsPrincipalFromToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var identity = new ClaimsIdentity();

            if (tokenHandler.CanReadToken(token))
            {
                var jwtSecurityToken = tokenHandler.ReadJwtToken(token);
                identity = new(jwtSecurityToken.Claims, "Agrismart Agronomic");
            }

            return new(identity);
        }
    }


}
