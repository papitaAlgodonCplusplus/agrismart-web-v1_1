using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using AgriSmart.Infrastructure.Repositories.Query;
using MediatR;
using Microsoft.Extensions.Logging;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    /// <summary>
    /// Handler for user registration command
    /// </summary>
    public class RegisterCommandHandler : IRequestHandler<RegisterCommand, Response<RegisterResponse>>
    {
        private readonly IUserCommandRepository _userCommandRepository;
        private readonly IUserQueryRepository _userQueryRepository;
        private readonly ILogger<RegisterCommandHandler> _logger;

        public RegisterCommandHandler(
            IUserCommandRepository userCommandRepository,
            IUserQueryRepository userQueryRepository,
            ILogger<RegisterCommandHandler> logger)
        {
            _userCommandRepository = userCommandRepository;
            _userQueryRepository = userQueryRepository;
            _logger = logger;
        }

        public async Task<Response<RegisterResponse>> Handle(RegisterCommand request, CancellationToken cancellationToken)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(request.UserEmail))
                {
                    return new Response<RegisterResponse>
                    {
                        Success = false,
                        Exception = "Email is required"
                    };
                }

                if (string.IsNullOrWhiteSpace(request.Password))
                {
                    return new Response<RegisterResponse>
                    {
                        Success = false,
                        Exception = "Password is required"
                    };
                }

                if (request.Password != request.ConfirmPassword)
                {
                    return new Response<RegisterResponse>
                    {
                        Success = false,
                        Exception = "Passwords do not match"
                    };
                }

                // Check if user already exists
                var existingUser = await _userQueryRepository.GetByEmailAsync(request.UserEmail);
                if (existingUser != null)
                {
                    return new Response<RegisterResponse>
                    {
                        Success = false,
                        Exception = "User with this email already exists"
                    };
                }

                // Create new user entity
                var newUser = new User
                {
                    UserEmail = request.UserEmail,
                    Password = request.Password, // In production, hash this password!
                    ClientId = request.ClientId,
                    ProfileId = request.ProfileId,
                    UserStatusId = 1, // Active status
                    CreatedBy = 1 // System user
                };

                // Save to database
                await _userCommandRepository.CreateAsync(newUser);

                _logger.LogInformation($"User registered successfully: {request.UserEmail}");

                return new Response<RegisterResponse>
                {
                    Success = true,
                    Result = new RegisterResponse
                    {
                        UserId = newUser.Id,
                        UserEmail = newUser.UserEmail!,
                        ClientId = newUser.ClientId,
                        ProfileId = newUser.ProfileId,
                        Message = "User registered successfully"
                    }
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during user registration");
                return new Response<RegisterResponse>
                {
                    Success = false,
                    Exception = $"Registration failed: {ex.Message}"
                };
            }
        }
    }
}