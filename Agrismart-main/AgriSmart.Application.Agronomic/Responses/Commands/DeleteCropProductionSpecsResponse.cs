namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record DeleteCropProductionSpecsResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Crop production specs deleted successfully";
    }
}
