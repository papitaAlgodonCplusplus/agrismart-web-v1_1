namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllCropsRequest
    {
        public bool IncludeInactives { get; set; }
    }
}
