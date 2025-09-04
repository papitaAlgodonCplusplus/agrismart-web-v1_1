namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllCatalogsRequest
    {
        public int ClientId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
