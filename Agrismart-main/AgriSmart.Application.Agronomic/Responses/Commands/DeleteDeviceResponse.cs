namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteDeviceResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Device deleted successfully";
    }
}