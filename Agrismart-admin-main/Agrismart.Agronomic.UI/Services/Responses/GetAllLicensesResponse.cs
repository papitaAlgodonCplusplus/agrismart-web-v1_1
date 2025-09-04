using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllLicensesResponse
    {
        public IReadOnlyList<License>? Licenses { get; set; } = new List<License>();
    }
}