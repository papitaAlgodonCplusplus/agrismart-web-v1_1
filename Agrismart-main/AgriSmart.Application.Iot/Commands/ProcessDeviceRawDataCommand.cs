using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Commands
{
    public class ProcessDeviceRawDataCommand : IRequest<Response<ProcessDeviceRawDataResponse>>
    {
        public string DeviceId { get; set; }
    }
}
