using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllClientsResponse
    {
        public IReadOnlyList<Client>? Clients { get; set; } = new List<Client>();
    }
}
