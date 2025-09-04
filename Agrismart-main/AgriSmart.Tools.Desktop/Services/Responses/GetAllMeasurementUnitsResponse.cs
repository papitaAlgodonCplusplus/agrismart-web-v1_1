using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllMeasurementUnitsResponse
    {
        public List<MeasurementUnitModel>? MeasurementUnits { get; set; }
    }
}
