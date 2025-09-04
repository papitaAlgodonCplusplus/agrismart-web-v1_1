using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllLicensesResponse
    {
        public IReadOnlyList<License>? Licenses { get; set; } = new List<License>();
    }
}
