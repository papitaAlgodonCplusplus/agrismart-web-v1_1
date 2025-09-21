namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteCropResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Crop deleted successfully";
    }
}