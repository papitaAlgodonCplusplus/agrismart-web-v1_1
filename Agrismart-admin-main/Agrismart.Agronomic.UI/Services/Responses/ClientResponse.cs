namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record ClientResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
    }
}