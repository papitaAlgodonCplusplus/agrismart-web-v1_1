namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllClientsRequest
    {
        public bool IncludeInactives { get; set; }
    }
}
