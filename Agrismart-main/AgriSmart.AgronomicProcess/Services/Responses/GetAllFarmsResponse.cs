using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllFarmsResponse
    {
        public IReadOnlyList<Farm>? Farms { get; set; }
    }
}
