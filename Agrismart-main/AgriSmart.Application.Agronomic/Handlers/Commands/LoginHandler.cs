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
                // DEBUG: Add logging to see what's being received
                Console.WriteLine($"DEBUG LoginHandler - UserEmail: '{command.UserEmail}'");
                Console.WriteLine($"DEBUG LoginHandler - Password: '{command.Password}'");
                Console.WriteLine($"DEBUG LoginHandler - UserEmail is null: {command.UserEmail == null}");
                Console.WriteLine($"DEBUG LoginHandler - Password is null: {command.Password == null}");

                var authenticateResult = await _userQueryRepository.AuthenticateAsync(command.UserEmail, command.Password);

                if (authenticateResult != null)
                {
                    Console.WriteLine($"DEBUG LoginHandler - Authentication successful for user: {authenticateResult.UserEmail}");
                    
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
                
                Console.WriteLine("DEBUG LoginHandler - Authentication failed - no user found");
                return new Response<LoginResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"DEBUG LoginHandler - Exception: {ex.Message}");
                return new Response<LoginResponse>(ex);
            }
        }
    }
}