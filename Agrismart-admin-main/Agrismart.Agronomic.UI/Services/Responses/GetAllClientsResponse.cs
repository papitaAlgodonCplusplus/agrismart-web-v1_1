using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllClientsResponse
    {
        public IReadOnlyList<Client>? Clients { get; set; } = new List<Client>();
    }
}