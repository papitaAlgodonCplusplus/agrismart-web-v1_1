namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllCalculationSettingsRequest
    {
        public int CatalogId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}