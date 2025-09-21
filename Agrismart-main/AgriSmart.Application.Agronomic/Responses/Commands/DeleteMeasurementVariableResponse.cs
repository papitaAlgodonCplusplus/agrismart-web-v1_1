namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteMeasurementVariableResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "MeasurementVariable deleted successfully";
    }
}