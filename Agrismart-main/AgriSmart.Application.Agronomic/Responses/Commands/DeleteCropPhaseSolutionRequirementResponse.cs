namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record DeleteCropPhaseSolutionRequirementResponse
    {
        public int Id { get; set; }
        public string? Message { get; set; }
    }
}