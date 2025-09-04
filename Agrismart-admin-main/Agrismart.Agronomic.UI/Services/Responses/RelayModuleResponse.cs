namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record RelayModuleResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}