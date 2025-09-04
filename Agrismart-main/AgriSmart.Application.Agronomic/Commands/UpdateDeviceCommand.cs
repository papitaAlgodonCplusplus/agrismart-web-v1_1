using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateDeviceCommand : IRequest<Response<UpdateDeviceResponse>>
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool Active { get; set; }
    }
}
