using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCropProductionDeviceCommand : IRequest<Response<CreateCropProductionDeviceResponse>>
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
        public DateTime? StartDate { get; set; }
    }
}
