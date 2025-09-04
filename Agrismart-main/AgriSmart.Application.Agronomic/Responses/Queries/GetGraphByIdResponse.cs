using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetGraphByIdResponse
    {
        public Graph? Graph { get; set; } = new Graph();
    }
}
