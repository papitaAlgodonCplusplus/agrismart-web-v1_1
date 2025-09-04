namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllRelayModulesRequest
    {
        public bool IncludeInactives { get; set; }
    }
}