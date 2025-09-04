namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateClientRequest
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
    }
}
