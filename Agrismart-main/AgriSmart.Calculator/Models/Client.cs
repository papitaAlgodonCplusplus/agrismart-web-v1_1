namespace AgriSmart.Calculator.Models
{
    public record Client
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
    }
}
