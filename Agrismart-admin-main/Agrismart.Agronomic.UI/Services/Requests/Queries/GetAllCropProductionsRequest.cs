namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllCropProductionsRequest
    {
        public int ClientId { get; set; }
        public int CompanyId { get; set; }
        public int FarmId { get; set; }
        public int ProductionUnitId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
