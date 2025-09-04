namespace AgriSmart.Tools.Entities
{
    public class CropProductionIrrigationSectorEntity: BaseEntity
    {
        public string Polygon { get; set; }
        public RelayEntity PumpRelay { get; set; }
        public RelayEntity ValveRelay { get; set; }

        public CropProductionIrrigationSectorEntity()
        {
        }

        public CropProductionIrrigationSectorEntity(int idSector)
        {
            this.Id = idSector;
        }


    }
}
