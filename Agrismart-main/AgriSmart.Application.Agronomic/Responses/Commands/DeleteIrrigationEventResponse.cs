namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteIrrigationEventResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "IrrigationEvent deleted successfully";
    }
}