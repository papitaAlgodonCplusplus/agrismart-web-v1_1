using AgriSmart.AgronomicProcess.Models;
using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllProductionUnitsResponse
    {
        public List<ProductionUnitModel>? ProductionUnits { get; set; }
    }
}
