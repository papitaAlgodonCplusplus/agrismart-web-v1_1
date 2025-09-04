namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllUserStatusesRequest
    {
        public bool IncludeInactives { get; set; }
    }
}