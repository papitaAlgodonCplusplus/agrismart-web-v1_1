namespace AgriSmart.Core.Entities
{
    public class MeasurementVariableStandard : BaseEntity
    {
        public string Name { get; set; }
        public int MeasurementUnitId { get; set; }
        public bool? Active {get; set;}
    }
}