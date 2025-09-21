namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteFertilizerInputResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "FertilizerInput deleted successfully";
    }
}