using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropByIdResponse
    {
        public Crop? Crop { get; set; } = new Crop();
    }
}
