namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllCropPhasesRequest
    {
        public int CropId { get; set; }
        public int CatalogId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}