using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropProductionByIdResponse
    {
        public CropProduction? CropProduction { get; set; } = new CropProduction();
    }
}
