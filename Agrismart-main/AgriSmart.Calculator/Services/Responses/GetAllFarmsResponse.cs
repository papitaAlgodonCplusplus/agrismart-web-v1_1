using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllFarmsResponse
    {
        public IReadOnlyList<Farm>? Farms { get; set; }
    }
}
