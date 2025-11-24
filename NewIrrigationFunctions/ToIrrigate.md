// Interfaces
interface Volume {
  value: number;
}

interface Container {
  volume: Volume;
}

interface Dropper {
  flowRate: number; // Liters per hour
}

interface GrowingMedium {
  containerCapacityPercentage: number;
  totalAvailableWaterPercentage: number;
  easelyAvailableWaterPercentage: number;
  reserveWaterPercentage: number;
}

interface CropProductionEntity {
  growingMedium: GrowingMedium;
  depletionPercentage: number;
  drainThreshold: number;
  container: Container;
  dropper: Dropper;
  numberOfDroppersPerContainer: number;
}

interface IrrigationMonitorResponse {
  irrigate: boolean;
  irrigationTime: number; // Minutes
}

// Main Function
function toIrrigate(cropProduction: CropProductionEntity): IrrigationMonitorResponse {
  // Initialize response object with default values
  const response: IrrigationMonitorResponse = {
    irrigate: false,
    irrigationTime: 0
  };

  // Calculate the target soil moisture level (setpoint) at which irrigation should start
  // Formula: Container Capacity - (Total Available Water × Depletion Percentage)
  const volumetricHumeditySetPoint = 
    cropProduction.growingMedium.containerCapacityPercentage - 
    cropProduction.growingMedium.totalAvailableWaterPercentage * 
    (cropProduction.depletionPercentage / 100.0);

  // TODO: Get actual measured volumetric humidity from sensor (currently hardcoded)
  const measuredVolumetricHumedity = 70;

  // TODO: Get previous irrigation volume from last event (currently hardcoded)
  const previousIrrigationVolumen = 1000;

  // TODO: Get previous drain volume from last event (currently hardcoded)
  const previousDrainVolumen = 150;

  // Calculate the drain percentage from the previous irrigation event
  // Formula: (Drain Volume / Irrigation Volume) × 100
  const previousDrainPercentage = 
    (previousDrainVolumen / previousIrrigationVolumen) * 100;

  // Check if current moisture is below setpoint (irrigation needed)
  if (measuredVolumetricHumedity < volumetricHumeditySetPoint) {
    // Calculate difference between target drain and actual previous drain
    // Positive = need more drain, Negative = too much drain
    const drainDifference = 
      cropProduction.drainThreshold - previousDrainPercentage;

    // Get the total volume capacity of the container (liters)
    const containerVolumen = cropProduction.container.volume.value;

    // Calculate volume of easily available water in container
    // Formula: Container Volume × (Easily Available Water % / 100)
    const easelyAvailableWaterVolumen = 
      containerVolumen * 
      (cropProduction.growingMedium.easelyAvailableWaterPercentage / 100.0);

    // Calculate volume of reserve water in container
    // Formula: Container Volume × (Reserve Water % / 100)
    const reserveWaterVolumen = 
      containerVolumen * 
      (cropProduction.growingMedium.reserveWaterPercentage / 100.0);

    // Calculate total volume of available water in container
    // Formula: Container Volume × (Total Available Water % / 100)
    const totalAvailableWaterVolumen = 
      containerVolumen * 
      (cropProduction.growingMedium.totalAvailableWaterPercentage / 100.0);

    // Calculate water volume consumed when reaching irrigation threshold
    // Formula: Total Available Water × (Depletion % / 100)
    const volumenWaterConsumptionAtIrrigationThreshold = 
      totalAvailableWaterVolumen * 
      (cropProduction.depletionPercentage / 100);

    // Calculate target drain volume based on drain threshold
    // Formula: Total Available Water × (Drain Threshold % / 100)
    const volumenWaterDrainedAtDrainThreshold = 
      totalAvailableWaterVolumen * 
      (cropProduction.drainThreshold / 100);

    // Calculate total irrigation volume needed
    // Formula: Water Consumption + Target Drain + Adjustment for drain difference
    const totalIrrigationVolumen = 
      volumenWaterConsumptionAtIrrigationThreshold + 
      volumenWaterDrainedAtDrainThreshold + 
      volumenWaterConsumptionAtIrrigationThreshold * drainDifference / 100;

    // Calculate flow rate per container (liters per hour)
    // Formula: Flow Rate per Dropper × Number of Drippers
    const flowRatePerContainer = 
      cropProduction.dropper.flowRate * 
      cropProduction.numberOfDroppersPerContainer;

    // Calculate irrigation time in minutes
    // Formula: (Volume / Flow Rate) × 60 to convert hours to minutes
    const irrigationTimeSpan = Math.floor(
      (totalIrrigationVolumen / flowRatePerContainer) * 60.0
    );

    // Set response to indicate irrigation is needed
    response.irrigate = true;
    // Set the calculated irrigation time in minutes
    response.irrigationTime = irrigationTimeSpan;
  }

  // Return the response (irrigate true/false and time in minutes)
  return response;
}

// Export for use in other modules
export { toIrrigate, IrrigationMonitorResponse, CropProductionEntity };