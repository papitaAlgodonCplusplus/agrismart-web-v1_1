namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllWaterChemistriesRequest
    {
        public int WaterId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}