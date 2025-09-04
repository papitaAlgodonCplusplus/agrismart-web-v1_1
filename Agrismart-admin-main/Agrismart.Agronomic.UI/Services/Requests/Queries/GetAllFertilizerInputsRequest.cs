namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllFertilizerInputsRequest
    {
        public int CatalogId { get; set; }
        public int FertilizerId {  get; set; }
        public bool IncludeInactives { get; set; }
    }
}