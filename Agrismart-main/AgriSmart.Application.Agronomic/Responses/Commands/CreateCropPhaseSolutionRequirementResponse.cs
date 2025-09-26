namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateCropPhaseSolutionRequirementResponse
    {
        public int Id { get; set; }
        public string? Message { get; set; }
    }
}