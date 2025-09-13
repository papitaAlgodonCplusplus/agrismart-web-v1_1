using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetCropProductionIntegrationQuery : IRequest<CropProductionIntegrationDto>
    {
        public int CropProductionId { get; set; }
        
        public GetCropProductionIntegrationQuery(int cropProductionId)
        {
            CropProductionId = cropProductionId;
        }
    }
}