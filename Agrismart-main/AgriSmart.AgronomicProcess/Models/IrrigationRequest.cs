namespace AgriSmart.AgronomicProcess.Models
{
    public class IrrigationRequest 
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public bool Irrigate { get; set; }
        public int IrrigationTime { get; set; } 
        public DateTime? DateStarted { get; set; }
        public DateTime? DateEnded { get; set; }
    }
}
