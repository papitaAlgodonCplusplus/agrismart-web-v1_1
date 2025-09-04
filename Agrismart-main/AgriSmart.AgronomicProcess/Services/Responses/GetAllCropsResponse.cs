using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllCropsResponse
    {
        public IReadOnlyList<Crop>? Crops { get; set; }
    }
}
