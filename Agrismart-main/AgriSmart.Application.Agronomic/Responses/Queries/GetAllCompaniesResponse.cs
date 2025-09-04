using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCompaniesResponse
    {
        public IReadOnlyList<Company>? Companies { get; set; } = new List<Company>();
    }
}
