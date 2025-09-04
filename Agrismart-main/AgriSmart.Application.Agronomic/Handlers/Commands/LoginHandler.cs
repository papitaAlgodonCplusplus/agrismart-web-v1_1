using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Configuration;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class LoginHandler : IRequestHandler<LoginCommand, Response<LoginResponse>>
    {
        private readonly IUserQueryRepository _userQueryRepository;

        public LoginHandler(IUserQueryRepository userQueryRepository)
        {
            _userQueryRepository = userQueryRepository;
        }

        public async Task<Response<LoginResponse>> Handle(LoginCommand command, CancellationToken cancellationToken)
        {
            try
            {

                var authenticateResult = await _userQueryRepository.AuthenticateAsync(command.UserEmail, command.Password);

                if (authenticateResult != null)
                {
                    LoginResponse loginResponse = new LoginResponse()
                    {
                        Id = authenticateResult.Id, 
                        ClientId = authenticateResult.ClientId,
                        UserName = command.UserEmail,
                        ProfileId = authenticateResult.ProfileId,
                        Active = authenticateResult.UserStatusId == 1
                    };

                    return new Response<LoginResponse>(loginResponse);
                }
                return new Response<LoginResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<LoginResponse>(ex);
            }
        }


    }
}
