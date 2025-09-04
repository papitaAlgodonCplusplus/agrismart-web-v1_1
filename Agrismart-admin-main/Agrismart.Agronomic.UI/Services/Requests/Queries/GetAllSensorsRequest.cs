namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllSensorsRequest
    {
        public int CompanyId { get; set; }
        public int DeviceId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
