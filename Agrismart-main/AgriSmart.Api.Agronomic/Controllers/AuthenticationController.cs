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
        /// User registration endpoint
        /// </summary>
        /// <param name="command">Registration details</param>
        /// <returns>Registration response</returns>
        [HttpPost("Register")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<RegisterResponse>>> Register(RegisterCommand command)
        {
            try
            {
                var response = await _mediator.Send(command);
                return response.Success ? Ok(response) : BadRequest(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new Response<RegisterResponse>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
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

        /// <summary>
        /// Refresh an existing token to extend its expiration time
        /// </summary>
        /// <returns>Updated token with new expiration</returns>
        [HttpPost("RefreshToken")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<LoginResponse>>> RefreshToken()
        {
            try
            {
                // Get the current user's token from the Authorization header
                var authHeader = Request.Headers["Authorization"].ToString();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                {
                    return Unauthorized();
                }

                var token = authHeader.Substring("Bearer ".Length).Trim();

                // Validate and decode the existing token
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(_jwtConfiguration.Secret);

                try
                {
                    var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = true,
                        ValidIssuer = _jwtConfiguration.ValidIssuer,
                        ValidateAudience = true,
                        ValidAudience = _jwtConfiguration.ValidAudience,
                        ValidateLifetime = false // We don't validate lifetime since we're refreshing
                    }, out SecurityToken validatedToken);

                    // Extract claims from the existing token
                    var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                    var clientId = principal.FindFirst(ClaimTypes.PrimarySid)?.Value;
                    var profileId = principal.FindFirst(ClaimTypes.Role)?.Value;
                    var userName = principal.FindFirst(ClaimTypes.Name)?.Value;

                    if (string.IsNullOrEmpty(userId))
                    {
                        return Unauthorized();
                    }

                    // Create new claims with the same information
                    var authClaims = new List<Claim>
            {
                new Claim(ClaimTypes.Name, userName),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.PrimarySid, clientId),
                new Claim(ClaimTypes.Role, profileId)
            };

                    // Generate new token with extended expiration
                    var newToken = GetToken(authClaims);
                    var newTokenString = new JwtSecurityTokenHandler().WriteToken(newToken);

                    // Create response
                    var loginResponse = new LoginResponse
                    {
                        Id = int.Parse(userId),
                        ClientId = int.Parse(clientId),
                        UserName = userName,
                        ProfileId = int.Parse(profileId),
                        Token = newTokenString,
                        ValidTo = newToken.ValidTo,
                        Active = true
                    };

                    var response = new Response<LoginResponse>(loginResponse);

                    return Ok(response);
                }
                catch (SecurityTokenException)
                {
                    return Unauthorized();
                }
            }
            catch (Exception ex)
            {
                return Unauthorized();
            }
        }
    }
}
