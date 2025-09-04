using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Entities
{
    public class IrrigationMeasurementEntity
    {
        public long Id { get; set; }
        public int EventId { get; set; }
        public int MeasurementVariableId { get; set; }
        public double RecordValue { get; set; }

        public IrrigationMeasurementEntity(IrrigationMeasurement model)
        {
            this.CopyPropertiesFrom(model);
        }

    }
}
