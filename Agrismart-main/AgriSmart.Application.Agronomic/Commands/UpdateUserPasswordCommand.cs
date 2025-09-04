using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateUserPasswordCommand : IRequest<Response<UpdateUserPasswordResponse>>
    {
        public string? CurrentPassword { get; set; }
        public string? NewPassword { get; set; }
    }
}
