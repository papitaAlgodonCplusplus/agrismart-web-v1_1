namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteAnalyticalEntityResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "AnalyticalEntity deleted successfully";
    }
}