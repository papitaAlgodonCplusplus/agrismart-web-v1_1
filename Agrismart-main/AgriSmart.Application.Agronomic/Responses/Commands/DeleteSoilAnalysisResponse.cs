namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record DeleteSoilAnalysisResponse
    {
        public int Id { get; set; }
        public bool Success { get; set; }
        public string Message { get; set; }
    }
}
