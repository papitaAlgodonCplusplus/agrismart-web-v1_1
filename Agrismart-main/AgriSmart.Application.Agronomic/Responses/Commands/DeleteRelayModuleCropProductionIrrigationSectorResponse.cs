namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record DeleteRelayModuleCropProductionIrrigationSectorResponse
    {
        public int RelayModuleId { get; set; }
        public int CropProductionIrrigationSectorId { get; set; }
    }
}