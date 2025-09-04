namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record LoginRequest
    {
        public string? UserEmail { get; set; }
        public string? Password { get; set; }
    }
}
