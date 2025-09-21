namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteSensorResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Sensor deleted successfully";
    }
}