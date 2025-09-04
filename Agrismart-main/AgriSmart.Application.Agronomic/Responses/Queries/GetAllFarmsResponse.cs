using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllFarmsResponse
    {
        public IReadOnlyList<Farm>? Farms { get; set; } = new List<Farm>();
    }
}
