namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateClientRequest
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}