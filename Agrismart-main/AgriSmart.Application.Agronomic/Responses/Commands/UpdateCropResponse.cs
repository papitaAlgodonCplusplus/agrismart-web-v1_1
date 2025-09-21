namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class UpdateCropResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public string Message { get; set; } = "Crop updated successfully";
    }
}