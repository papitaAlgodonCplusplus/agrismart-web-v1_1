namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllDevicesRequest
    {
        public int CompanyId { get; set; }
        public int CropProductionId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
