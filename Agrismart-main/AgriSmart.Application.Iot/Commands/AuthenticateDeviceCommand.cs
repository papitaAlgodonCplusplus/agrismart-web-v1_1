using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Commands
{
    public record AuthenticateDeviceCommand : IRequest<Response<AuthenticateDeviceResponse>>
    {
        public string? DeviceId { get; set; }
        public string? Password { get; set; }
    }
}
