namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllProfilesRequest
    {
        public bool IncludeInactives { get; set; }
    }
}