using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCropProductionDevicesQuery : IRequest<Response<GetAllCropProductionDevicesResponse>>
    {
        public int CropProductionId { get; set; }
    }
}