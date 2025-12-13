using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropProductionSpecsByIdResponse
    {
        public CropProductionSpecs? CropProductionSpecs { get; set; }
    }
}
