using System;

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateSoilAnalysisResponse
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public int? AnalyticalEntityId { get; set; }
        public DateTime SampleDate { get; set; }
        public string LabReportNumber { get; set; }
        public string LabName { get; set; }
        public string TextureClass { get; set; }
        public decimal? PhSoil { get; set; }
        public decimal? OrganicMatterPercent { get; set; }
        public decimal? CaToMgRatio { get; set; }
        public decimal? MgToKRatio { get; set; }
        public decimal? BaseSaturationPercent { get; set; }
        public bool Active { get; set; }
        public DateTime? DateUpdated { get; set; }
    }
}
