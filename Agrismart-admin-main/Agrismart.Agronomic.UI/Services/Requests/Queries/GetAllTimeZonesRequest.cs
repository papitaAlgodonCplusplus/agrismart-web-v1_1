namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllTimeZonesRequest
    {
        public bool IncludeInactives { get; set; }
    }
}
