namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllCropProductionIrrigationSectorsRequest
    {
        public int CompanyId { get; set; }
        public int FarmId { get; set; }
        public int ProductionUnitId { get; set; }
        public int CropProductionId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}
