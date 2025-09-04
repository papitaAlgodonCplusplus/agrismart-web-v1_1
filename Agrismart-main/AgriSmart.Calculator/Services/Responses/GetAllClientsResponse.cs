using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllClientsResponse
    {
        public IReadOnlyList<Client>? Clients { get; set; }
    }
}
