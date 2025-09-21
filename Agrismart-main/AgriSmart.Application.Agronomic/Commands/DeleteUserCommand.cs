using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteUserCommand : IRequest<Response<DeleteUserResponse>>
    {
        public int Id { get; set; }
    }
}