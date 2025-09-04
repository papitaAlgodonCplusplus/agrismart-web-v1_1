using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateCropProductionDeviceCommand : IRequest<Response<UpdateCropProductionDeviceResponse>>
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
        DateTime? InitDate { get; set; }
    }
}
