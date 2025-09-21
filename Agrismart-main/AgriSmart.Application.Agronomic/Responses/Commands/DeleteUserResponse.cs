namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteUserResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "User deleted successfully";
    }
}