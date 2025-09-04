namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllFertilizerChemistriesRequest
    {
        public int FertilizerId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}