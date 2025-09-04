namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllCompaniesRequest
    {
        public int ClientId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
