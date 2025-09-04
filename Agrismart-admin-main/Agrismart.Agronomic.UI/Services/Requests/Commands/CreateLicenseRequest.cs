namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateLicenseRequest
    {
        public int ClientId { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int? AllowedCompanies { get; set; }
        public int? AllowedFarms { get; set; }
        public int? AllowedUsers { get; set; }
        public int? AllowedProductionUnits { get; set; }
        public int? AllowedCropProductions { get; set; }
    }
}