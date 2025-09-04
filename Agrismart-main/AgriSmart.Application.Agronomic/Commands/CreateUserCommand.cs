using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateUserCommand : IRequest<Response<CreateUserResponse>>
    {
        public int ProfileId { get; set; }
        public int ClientId { get; set; }
        public string? UserEmail { get; set; }
    }
}
