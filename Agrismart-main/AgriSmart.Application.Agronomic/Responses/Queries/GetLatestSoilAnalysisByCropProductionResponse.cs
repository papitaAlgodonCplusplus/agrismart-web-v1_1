using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetLatestSoilAnalysisByCropProductionResponse
    {
        public SoilAnalysis SoilAnalysis { get; set; }
    }
}
