namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteContainerResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Container deleted successfully";
    }
}