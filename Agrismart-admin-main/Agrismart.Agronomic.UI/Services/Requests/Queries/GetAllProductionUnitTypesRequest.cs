namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllProductionUnitTypesRequest
    {
        public bool IncludeInactives { get; set; }
    }
}
