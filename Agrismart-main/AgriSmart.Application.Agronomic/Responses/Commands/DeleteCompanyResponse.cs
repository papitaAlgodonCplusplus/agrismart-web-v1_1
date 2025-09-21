namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteCompanyResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "Company deleted successfully";
    }
}