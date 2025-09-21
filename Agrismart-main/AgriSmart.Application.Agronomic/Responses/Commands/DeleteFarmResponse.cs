namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteFarmResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Farm deleted successfully";
    }
}