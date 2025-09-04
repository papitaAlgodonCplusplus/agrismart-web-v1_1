namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateRelayModuleRequest
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}