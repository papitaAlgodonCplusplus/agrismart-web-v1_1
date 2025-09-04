using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Logic
{
    public class CalculationInput
    {
        public DateTime StartingDate { get; set; }
        public DateTime EndingDate { get; set; }
        public CropProductionEntity CropProduction { get; set; }
        public List<MeasurementVariable> MeasurementVariables { get; set; }
        public List<Measurement> ClimateData { get; set; }
        public List<IrrigationEventEntity> IrrigationData { get; set; }
        public List<Measurement> GrowingMediumData { get; set; }
        public List<MeasurementKPI> CurrentDateTimeMeasurementKPIs { get; set; }
    }
}
