using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateUserCommand : IRequest<Response<UpdateUserResponse>>
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public int ClientId { get; set; }
        public string? UserEmail { get; set; }
        public int UserStatusId { get; set; }
    }
}
