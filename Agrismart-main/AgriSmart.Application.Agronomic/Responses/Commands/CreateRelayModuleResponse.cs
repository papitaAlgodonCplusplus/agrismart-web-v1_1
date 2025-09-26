namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateRelayModuleResponse
    {
        public int Id { get; set; } 
        public string? Name { get; set; }
        public bool? Active { get; set; }
    }
}