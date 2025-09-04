using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Configuration;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AgriSmart.API.Agronomic.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthenticationController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly JWTConfiguration _jwtConfiguration;
        public AuthenticationController(IMediator mediator, IOptions<JWTConfiguration> options)
        {
            _mediator = mediator;
            _jwtConfiguration = options.Value;
        }


        /// <summary>
        /// 
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("Login")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<LoginResponse>>> Post(LoginCommand command)
        {
            try
            {
                //_logger.LogInformation(command.ToString());
                var response = await _mediator.Send(command);

                if (response.Success)
                {

                    var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, command.UserEmail),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.NameIdentifier, response.Result.Id.ToString()),
                    new Claim(ClaimTypes.PrimarySid, response.Result.ClientId.ToString()),
                    new Claim(ClaimTypes.Role, response.Result.ProfileId.ToString())
                };

                    var token = GetToken(authClaims);

                    response.Result.Token = new JwtSecurityTokenHandler().WriteToken(token);
                    response.Result.ValidTo = token.ValidTo;

                    return Ok(response);
                }
            }
            catch (Exception ex)
            { }

            return Unauthorized();
        }


        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtConfiguration.Secret));

            var token = new JwtSecurityToken(
                issuer: _jwtConfiguration.ValidIssuer,
                audience: _jwtConfiguration.ValidAudience,
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

            return token;
        }

    }
}
