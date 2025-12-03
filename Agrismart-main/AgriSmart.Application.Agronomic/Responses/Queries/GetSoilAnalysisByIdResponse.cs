using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetSoilAnalysisByIdResponse
    {
        public SoilAnalysis SoilAnalysis { get; set; }
    }
}
