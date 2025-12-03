using System.Collections.Generic;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAvailableNutrientsResponse
    {
        public Dictionary<string, decimal> AvailableNutrients { get; set; } = new Dictionary<string, decimal>();
    }
}
