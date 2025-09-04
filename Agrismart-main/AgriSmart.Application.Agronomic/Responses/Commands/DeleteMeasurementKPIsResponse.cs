namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record DeleteMeasurementKPIsResponse
    {
        public int CropProductionId { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
    }
}
