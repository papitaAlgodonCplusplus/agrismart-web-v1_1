using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public record ProcessDeviceRawDataMeasurementsCommand : IRequest<Response<ProcessDeviceRawDataMeasurementsResponse>>
    {
        public int DeviceId { get; set; }
    }
}
