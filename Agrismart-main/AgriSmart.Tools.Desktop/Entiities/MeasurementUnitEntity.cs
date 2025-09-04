using AgriSmart.Tools.DataModels;

namespace AgriSmart.Tools.Entities
{
    public class MeasurementUnitEntity : BaseEntity
    {
        public string Name { get; set; }
        public string Symbol { get; set; }
        public int MeasureType { get; set; }
        public int BaseMeasureUnitId { get; set; }
        public double ConvertionFactorToBase { get; set; }
        public bool Active { get; set; }

        public MeasurementUnitEntity()
        {
        }

        public MeasurementUnitEntity(MeasurementUnitModel model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}
