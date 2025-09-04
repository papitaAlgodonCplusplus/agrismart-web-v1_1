using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Commands
{
    public record AuthenticateMqttClientCommand : IRequest<Response<AuthenticateMqttClientResponse>>
    {
        public string? ConnectUsername { get; set; }
        public string? ConnectPassword { get; set; }
    }
}
