using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateDeviceCommand : IRequest<Response<CreateDeviceResponse>>
    {
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
    }
}
