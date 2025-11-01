using MediatR;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;

namespace AgriSmart.Application.Agronomic.Commands
{
    /// <summary>
    /// Command for user registration
    /// </summary>
    public class RegisterCommand : IRequest<Response<RegisterResponse>>
    {
        public string UserEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string ConfirmPassword { get; set; } = string.Empty;
        public int ClientId { get; set; } = 0;
        public int ProfileId { get; set; } = 2; // Default to regular user profile
    }
}