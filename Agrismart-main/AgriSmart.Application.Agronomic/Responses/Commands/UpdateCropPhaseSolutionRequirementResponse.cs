namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateCropPhaseSolutionRequirementResponse
    {
        public int Id { get; set; }
        public string? Message { get; set; }
    }
}