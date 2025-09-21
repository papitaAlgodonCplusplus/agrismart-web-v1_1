namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class DeleteLicenseResponse
    {
        public int Id { get; set; }
        public string Message { get; set; } = "License deleted successfully";
    }
}