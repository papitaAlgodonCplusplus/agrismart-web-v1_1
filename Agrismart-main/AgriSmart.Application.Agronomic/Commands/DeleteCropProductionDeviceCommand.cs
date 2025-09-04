using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCropProductionDeviceCommand : IRequest<Response<DeleteCropProductionDeviceResponse>>
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
    }
}
