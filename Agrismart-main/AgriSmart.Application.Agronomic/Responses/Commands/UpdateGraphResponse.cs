namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateGraphResponse
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? SummaryTimeScale { get; set; }
        public string? YAxisScaleType { get; set; }
        public string? Series { get; set; }
        public bool Active { get; set; }
    }
}
