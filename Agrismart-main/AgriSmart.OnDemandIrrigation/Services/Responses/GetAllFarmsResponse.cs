using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllFarmsResponse
    {
        public IReadOnlyList<Farm>? Farms { get; set; }
    }
}
