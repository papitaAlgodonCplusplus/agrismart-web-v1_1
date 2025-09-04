using AgriSmart.OnDemandIrrigation.Entities;
using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Logic
{
    public static class IrrigationMonitor
    {

        public enum IrrigationState { normal, irrigating, lixiviating, error }

        public static IrrigationMonitorResponse ToIrrigate(CropProductionEntity cropProduction)
        {
            IrrigationMonitorResponse response = new IrrigationMonitorResponse();

            // Validate required properties
            if (cropProduction == null)
            {
                throw new ArgumentNullException(nameof(cropProduction));
            }

            if (cropProduction.GrowingMedium == null)
            {
                throw new InvalidOperationException("GrowingMedium is required for irrigation calculations");
            }

            if (cropProduction.Container == null)
            {
                throw new InvalidOperationException("Container is required for irrigation calculations");
            }

            if (cropProduction.Dropper == null)
            {
                throw new InvalidOperationException("Dropper is required for irrigation calculations");
            }

            double volumetricHumeditySetPoint = cropProduction.GrowingMedium.ContainerCapacityPercentage -
                cropProduction.GrowingMedium.TotalAvailableWaterPercentage * (cropProduction.DepletionPercentage / 100.0);

            double measuredVolumetricHumedity = 70; // api.getVolumetricHumedity(cropProduction)

            double previousIrrigationVolumen = 1000; //api.getlastIrrigationStats(cropProduction)

            double previousDrainVolumen = 150; //api.getlastIrrigationStats(cropProduction)

            double previousDrainPercentage = previousIrrigationVolumen > 0 ?
                previousDrainVolumen / previousIrrigationVolumen * 100 : 0;

            if (measuredVolumetricHumedity < volumetricHumeditySetPoint)
            {
                double drainDifference = cropProduction.DrainThreshold - previousDrainPercentage;

                double containerVolumen = cropProduction.Container.Volume?.Value ?? 0;

                if (containerVolumen <= 0)
                {
                    throw new InvalidOperationException("Container volume must be greater than zero");
                }

                double easelyAvailableWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.EaselyAvailableWaterPercentage / 100.0);

                double reserveWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.ReserveWaterPercentage / 100.0);

                double totalAvailableWaterVolumen = containerVolumen * (cropProduction.GrowingMedium.TotalAvailableWaterPercentage / 100.0);

                double volumenWaterConsumptionAtIrrigationThreshold = totalAvailableWaterVolumen * (cropProduction.DepletionPercentage / 100);

                double volumenWaterDrainedAtDrainThreshold = totalAvailableWaterVolumen * (cropProduction.DrainThreshold / 100);

                double totalIrrigationVolumen = volumenWaterConsumptionAtIrrigationThreshold +
                    volumenWaterDrainedAtDrainThreshold +
                    volumenWaterConsumptionAtIrrigationThreshold * drainDifference / 100;

                double flowRatePerContainer = cropProduction.Dropper.FlowRate * cropProduction.NumberOfDroppersPerContainer;

                if (flowRatePerContainer <= 0)
                {
                    throw new InvalidOperationException("Flow rate per container must be greater than zero");
                }

                int irrigationTimeSpan = Convert.ToInt32(totalIrrigationVolumen / flowRatePerContainer * 60.0);

                response.Irrigate = true;
                response.IrrigationTime = irrigationTimeSpan;
            }

            return response;
        }

        public static bool ToStopIrregate()
        {

            return true;
        }

        public static bool IsRelayActive(Relay rely)
        {
            return false;
        }
    }

    public class IrrigationMonitorResponse
    {
        public bool Irrigate { get; set; } = false;
        public int IrrigationTime { get; set; } = 0;// in minutes
    }
}
