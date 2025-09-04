namespace AgriSmart.Tools.Configuration
{
    public record AgrismartApiConfiguration
    {
        public string? BaseAddress { get; set; }
        public string? AuthenticationUrl { get; set; }
        public string? GetCalculationSettingsUrl { get; set; }
        public string? GetCompaniesUrl { get; set; }
        public string? GetFarmsUrl { get; set; }
        public string? GetProductionUnitsUrl { get; set; }
        public string? GetCropProductionsUrl { get; set; }
        public string? GetCropsUrl { get; set; }
        public string? GetCropUrl { get; set; }
        public string? GetCropPhasesUrl { get; set; }
        public string? GetCropPhaseSolutionRequirementUrl { get; set; }
        public string? GetContainerUrl { get; set; }
        public string? GetDropperUrl { get; set; }
        public string? GetGrowingMediumUrl { get; set; }
        public string? GetCropProductionIrrigationSectorUrl { get; set; }
        public string? GetFertilizerInputsUrl { get; set; }
        public string? GetFertilizersUrl { get; set; }
        public string? GetFertilizerChemitriessUrl { get; set; }
        public string? GetWatersUrl { get; set; }
        public string? GetWaterChemistriesUrl { get; set; }
        public string? GetInputPresentationsUrl { get; set; }
        public string? GetMeasurementUnitsUrl { get; set; }
        public string? PostFertilizerChemistryUrl { get; set; }
        public string? PutFertilizerChemistryUrl { get; set; }
        public string? PostFertilizerUrl { get; set; }
        public string? PutFertilizerUrl { get; set; }
        public string? PostWaterUrl { get; set; }
        public string? PutWaterUrl { get; set; }
        public string? PostWaterChemistryUrl { get; set; }
        public string? PutWaterChemistryUrl { get; set; }
        public string? PostInputPresentationUrl { get; set; }
        public string? PutInputPresentationUrl { get; set; }
        public string? PostFertilizerInputUrl { get; set; }
        public string? PutFertilizerInputUrl { get; set; }
    }
}
