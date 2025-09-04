using MediatR;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Core.Responses;

namespace AgriSmart.Application.Iot.Commands
{
    public record AddMqttDeviceRawDataCommand : IRequest<Response<AddMqttDeviceRawDataResponse>>
    {
        public DateTime RecordDate { get; set; }
        public string? ClientId { get; set; }
        public string? UserId { get; set; }
        public string? DeviceId { get; set; }
        public string? Sensor { get; set; }
        public string? Payload { get; set; }
    }
}
