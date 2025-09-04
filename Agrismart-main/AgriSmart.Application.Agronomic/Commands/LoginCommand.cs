using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class LoginCommand : IRequest<Response<LoginResponse>>
    {
        public string? UserEmail { get; set; }
        public string? Password { get; set; }
    }
}
