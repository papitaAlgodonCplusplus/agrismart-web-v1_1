using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Entities
{ 
    public class IrrigationEventEntity
    {
        public long Id { get; set; }
        public DateTime RecordDateTime { get; set; }
        public int CropProductionId { get; set; }
        public DateTime DateTimeStart { get; set; }
        public DateTime DateTimeEnd { get; set; }
        public List<IrrigationMeasurementEntity> IrrigationMeasurements { get; set; }

        public IrrigationEventEntity(IrrigationEvent model)
        {
            this.CopyPropertiesFrom(model);
        }

        public void AddIrrigationMeasurement(IrrigationMeasurementEntity irrigationMeasurementEntity)
        {
            if (IrrigationMeasurements == null)
                IrrigationMeasurements = new List<IrrigationMeasurementEntity>();
            IrrigationMeasurements.Add(irrigationMeasurementEntity);
        }
    }
}
