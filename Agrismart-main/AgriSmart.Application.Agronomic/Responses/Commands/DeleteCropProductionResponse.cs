namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteCropProductionResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "CropProduction deleted successfully";
    }
}