namespace AgriSmart.Calculator.Configuration
{
    public record AgrismartApiConfiguration
    {
        public string? BaseAddress { get; set; }
        public string? AuthenticationUrl { get; set; }
        public string? GetClientsUrl { get; set; }
        public string? GetCompaniesUrl { get; set; }
        public string? GetFarmsUrl { get; set; }
        public string? GetProductionUnitsUrl { get; set; }
        public string? GetCropProductionsUrl { get; set; }
        public string? GetCropsUrl { get; set; }
        public string? GetContainerUrl { get; set; }
        public string? GetCropUrl { get; set; }
        public string? GetDevicesUrl { get; set; }
        public string? GetGrowingMediumUrl { get; set; }
        public string? GetCropProductionIrrigationSectorUrl { get; set; }
        public string? GetMeasurementKPILatestUrl { get; set; }
        public string? GetMeasurementsKPIUrl { get; set; }
        public string? GetMeasurementUrl {  get; set; }
        public string? GetMeasurementVariableStandardUrl { get; set; }
        public string? GetMeasurementVariablesUrl { get; set; }
        public string? GetIrrigationEventsUrl { get; set; }
        public string? GetIrrigationMeasurementUrl { get; set; }
        public string? ProcessDeviceRawDataClimateMeasurementsUrl { get; set; }
    }
}
