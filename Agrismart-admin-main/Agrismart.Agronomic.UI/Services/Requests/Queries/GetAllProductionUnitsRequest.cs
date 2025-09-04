namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllProductionUnitsRequest
    {
        public int CompanyId { get; set; }
        public int FarmId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
