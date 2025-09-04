namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllLicensesRequest
    {
        public int ClientId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
