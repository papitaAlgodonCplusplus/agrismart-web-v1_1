namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateUserRequest
    {
        public int ProfileId { get; set; }
        public int ClientId { get; set; }
        public string? UserEmail { get; set; }
    }
}