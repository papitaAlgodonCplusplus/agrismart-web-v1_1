using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteDeviceCommand : IRequest<Response<DeleteDeviceResponse>>
    {
        public int Id { get; set; }
    }
}