using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllClientsResponse
    {
        public IReadOnlyList<Client>? Companies { get; set; }
    }
}
