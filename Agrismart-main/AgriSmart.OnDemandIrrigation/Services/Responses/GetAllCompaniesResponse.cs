using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllCompaniesResponse
    {
        public IReadOnlyList<Company>? Companies { get; set; }
    }
}
