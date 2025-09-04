using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllCompaniesResponse
    {
        public IReadOnlyList<Company>? Companies { get; set; }
    }
}
