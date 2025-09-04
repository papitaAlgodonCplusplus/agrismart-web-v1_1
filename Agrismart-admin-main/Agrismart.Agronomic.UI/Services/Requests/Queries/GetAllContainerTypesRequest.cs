namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllContainerTypesRequest
    {
        public bool IncludeInactives { get; set; }
    }
}
