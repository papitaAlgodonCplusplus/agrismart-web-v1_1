using AgriSmart.Core.Entities;
using System.Collections.Generic;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetSoilAnalysesByCropProductionResponse
    {
        public List<SoilAnalysis> SoilAnalyses { get; set; } = new List<SoilAnalysis>();
    }
}
