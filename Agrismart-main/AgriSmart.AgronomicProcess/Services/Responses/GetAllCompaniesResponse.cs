using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllCompaniesResponse
    {
        public IReadOnlyList<Company>? Companies { get; set; }
    }
}
