using AgriSmart.OnDemandIrrigation.Entities;

namespace AgriSmart.OnDemandIrrigation.Logic
{
    public class IrrigationRequest
    {
        public CropProductionIrrigationSectorEntity IrrigationSector { get; set; }
        public int IrrigationTime { get; set; }
        public bool Done { get; set; }

        public IrrigationRequest(CropProductionIrrigationSectorEntity irrigationSector, int irrigationTime)
        {
            IrrigationSector = irrigationSector;
            IrrigationTime = irrigationTime;
        }

    }
}
