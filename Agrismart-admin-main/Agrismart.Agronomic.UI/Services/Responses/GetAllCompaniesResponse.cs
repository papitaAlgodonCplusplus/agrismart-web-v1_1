using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCompaniesResponse
    {
        public IReadOnlyList<Company>? Companies { get; set; } = new List<Company>();
    }
}