namespace AgriSmart.Core.Entities
{
    public class IrrigationRequest: BaseEntity
    {
        public int CropProductionId { get; set; }
        public bool Irrigate { get; set; }
        public int IrrigationTime { get; set; } 
        public DateTime? DateStarted { get; set; }
        public DateTime? DateEnded { get; set; }
    }
}
