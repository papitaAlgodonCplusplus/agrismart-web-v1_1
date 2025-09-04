namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateRelayModuleCropProductionIrrigationSectorResponse
    {
        public int RelayModuleId { get; set; }
        public int CropProductionIrrigationSectorId { get; set; }
    }
}