namespace AgriSmart.Core.Entities
{
    public class MeasurementUnit : BaseEntity
    {
        public string? Name { get; set; }
        public string? Symbol { get; set; }
        public int MeasureType { get; set; }
        public int BaseMeasureUnitId {get; set;}
        public double ConvertionFactorToBase { get; set; }
        public bool Active { get; set; }
    }
}