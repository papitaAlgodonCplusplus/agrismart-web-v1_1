using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetClientByIdResponse
    {
        public Client? Client { get; set; } = new Client();
    }
}
