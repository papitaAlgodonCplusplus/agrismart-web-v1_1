namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteClientResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Client deleted successfully";
    }
}