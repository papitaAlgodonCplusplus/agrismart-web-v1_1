# Function Explanation: CalculateIrrigationCalculationOutput

## Overview
This function calculates comprehensive irrigation metrics from irrigation event data. It transforms raw irrigation measurements into meaningful agricultural metrics used for irrigation management and crop production analysis.

---

## Input Parameters

```csharp
List<IrrigationEventEntity> inputs
```
- A list containing irrigation events
- **Index 0**: Current irrigation event being analyzed
- **Index 1** (optional): Previous irrigation event (used for interval calculation)

```csharp
CropProductionEntity cropProduction
```
- Contains crop layout information:
  - `BetweenRowDistance`: Distance between crop rows (meters)
  - `BetweenContainerDistance`: Distance between containers in a row (meters)
  - `BetweenPlantDistance`: Distance between plants in a row (meters)
  - `Area`: Total production area (square meters)

```csharp
List<MeasurementVariable> measurementVariables
```
- Definitions of measurement types
- Used to identify irrigation volume (StandardId = 19) and drain volume (StandardId = 20)

---

## Step-by-Step Calculation Process

### 1. **Initialize Output and Set Date**
```csharp
IrrigationMetric output = new IrrigationMetric();
output.Date = inputs[0].RecordDateTime;
```
Creates the output object and records when this irrigation event occurred.

---

### 2. **Calculate Irrigation Interval** (if previous event exists)
```csharp
if (inputs.Count > 1)
{
    output.IrrigationInterval = inputs[0].DateTimeStart - inputs[1].DateTimeEnd;
}
```
- Measures time elapsed between the **end** of the previous irrigation and the **start** of the current one
- Example: If previous irrigation ended at 8:00 AM and current started at 2:00 PM, interval = 6 hours

---

### 3. **Calculate Irrigation Length**
```csharp
output.IrrigationLength = inputs[0].DateTimeEnd - inputs[0].DateTimeStart;
```
- Duration of the current irrigation event
- Example: Started at 2:00 PM, ended at 2:30 PM → Length = 30 minutes

---

### 4. **Calculate Densities** (plants/containers per m²)
```csharp
double densityContainer = 1 / (cropProduction.BetweenRowDistance * cropProduction.BetweenContainerDistance);
double densityPlant = 1 / (cropProduction.BetweenRowDistance * cropProduction.BetweenPlantDistance);
```

**Example Calculation:**
- Row distance = 2 meters
- Container distance = 0.5 meters
- Plant distance = 0.25 meters

```
densityContainer = 1 / (2 × 0.5) = 1 container per m²
densityPlant = 1 / (2 × 0.25) = 2 plants per m²
```

---

### 5. **Calculate Irrigation Volumes**

#### a. Extract raw irrigation volume
```csharp
MeasurementVariable irrigationVolumeVariable = measurementVariables
    .Where(x => x.MeasurementVariableStandardId == 19).FirstOrDefault();
double irrigationVolumen = inputs[0].IrrigationMeasurements
    .Where(x => x.MeasurementVariableId == irrigationVolumeVariable.Id)
    .Sum(x => x.RecordValue);
```
- Finds all measurements with StandardId = 19 (irrigation volume)
- Sums all recorded values (in case multiple measurements exist)

#### b. Calculate volume per square meter
```csharp
output.IrrigationVolumenM2 = new Volume(irrigationVolumen * densityContainer, Volume.volumeMeasure.toLitre);
```
**Example:** 
- Raw volume = 5 liters per container
- Density = 1 container/m²
- Volume per m² = 5 × 1 = 5 liters/m²

#### c. Calculate volume per plant
```csharp
output.IrrigationVolumenPerPlant = new Volume(output.IrrigationVolumenM2.Value / densityPlant, Volume.volumeMeasure.toLitre);
```
**Example:**
- Volume per m² = 5 liters
- Plant density = 2 plants/m²
- Volume per plant = 5 / 2 = 2.5 liters/plant

#### d. Calculate total volume for entire area
```csharp
output.IrrigationVolumenTotal = new Volume(cropProduction.Area * output.IrrigationVolumenM2.Value, Volume.volumeMeasure.toLitre);
```
**Example:**
- Area = 1000 m²
- Volume per m² = 5 liters
- Total volume = 1000 × 5 = 5000 liters

---

### 6. **Calculate Drain Volumes and Percentage**

```csharp
MeasurementVariable drainVolumeVariable = measurementVariables
    .Where(x => x.MeasurementVariableStandardId == 20).FirstOrDefault();
double drainVolumen = inputs[0].IrrigationMeasurements
    .Where(x => x.MeasurementVariableId == drainVolumeVariable.Id)
    .Sum(x => x.RecordValue);
```
Similar process for drain volume (StandardId = 20)

```csharp
output.DrainVolumenM2 = new Volume(drainVolumen * densityContainer, Volume.volumeMeasure.toLitre);
output.DrainVolumenPerPlant = new Volume(output.DrainVolumenM2.Value / densityPlant, Volume.volumeMeasure.toLitre);
output.DrainPercentage = output.DrainVolumenM2.Value / output.IrrigationVolumenM2.Value * 100;
```

**Drain Percentage Example:**
- Irrigation = 5 liters/m²
- Drain = 1 liter/m²
- Drain percentage = (1 / 5) × 100 = 20%

*This indicates 20% of applied water drained away, which is important for irrigation efficiency.*

---

### 7. **Calculate Irrigation Flow Rate**
```csharp
output.IrrigationFlow = new Volume(irrigationVolumen / output.IrrigationLength.TotalHours, Volume.volumeMeasure.toLitre);
```

**Example:**
- Total volume applied = 5 liters
- Duration = 0.5 hours (30 minutes)
- Flow rate = 5 / 0.5 = 10 liters/hour

---

### 8. **Calculate Irrigation Precipitation Rate**
```csharp
output.IrrigationPrecipitation = new Volume(output.IrrigationVolumenM2.Value / output.IrrigationLength.TotalHours, Volume.volumeMeasure.none);
```

**Example:**
- Volume per m² = 5 liters
- Duration = 0.5 hours
- Precipitation rate = 5 / 0.5 = 10 liters/m²/hour

*This metric is similar to rainfall intensity and helps evaluate irrigation uniformity.*

---

### 9. **Set Crop Production ID and Return**
```csharp
output.CropProductionId = inputs[0].CropProductionId;
return output;
```

---

## Output Structure

The function returns an `IrrigationMetric` object containing:

| Metric | Description | Example Value |
|--------|-------------|---------------|
| `Date` | When irrigation occurred | 2024-11-22 14:00 |
| `IrrigationInterval` | Time since last irrigation | 6 hours |
| `IrrigationLength` | Duration of irrigation | 30 minutes |
| `IrrigationVolumenM2` | Water per square meter | 5 L/m² |
| `IrrigationVolumenPerPlant` | Water per plant | 2.5 L/plant |
| `IrrigationVolumenTotal` | Total water used | 5000 L |
| `DrainVolumenM2` | Drainage per square meter | 1 L/m² |
| `DrainVolumenPerPlant` | Drainage per plant | 0.5 L/plant |
| `DrainPercentage` | Percentage of water drained | 20% |
| `IrrigationFlow` | Flow rate | 10 L/hour |
| `IrrigationPrecipitation` | Application rate | 10 L/m²/hour |
| `CropProductionId` | Associated crop production | 123 |

---

## Key Agricultural Concepts

1. **Density Calculations**: Convert container/plant spacing into density per m² for proper scaling
2. **Volume Normalization**: Express volumes in multiple units (per m², per plant, total) for different analysis needs
3. **Drain Percentage**: Critical for irrigation efficiency - typical targets are 10-30%
4. **Flow/Precipitation Rates**: Help assess system performance and uniformity

This function is essential for irrigation management, allowing farmers to optimize water usage and improve crop health.


# TypeScript Equivalent of CalculateIrrigationCalculationOutput

Here's the complete TypeScript implementation with type definitions:

## Type Definitions

```typescript
// Enums
enum VolumeMeasure {
  toLitre = 'toLitre',
  none = 'none'
}

// Interfaces
interface IrrigationMeasurement {
  measurementVariableId: number;
  recordValue: number;
}

interface IrrigationEventEntity {
  recordDateTime: Date;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  cropProductionId: number;
  irrigationMeasurements: IrrigationMeasurement[];
}

interface CropProductionEntity {
  betweenRowDistance: number;
  betweenContainerDistance: number;
  betweenPlantDistance: number;
  area: number;
}

interface MeasurementVariable {
  id: number;
  measurementVariableStandardId: number;
}

// Volume class
class Volume {
  value: number;
  measure: VolumeMeasure;

  constructor(value: number, measure: VolumeMeasure) {
    this.value = value;
    this.measure = measure;
  }
}

// Output interface
interface IrrigationMetric {
  date: Date;
  irrigationInterval?: number; // Time in milliseconds
  irrigationLength: number; // Time in milliseconds
  irrigationVolumenM2: Volume;
  irrigationVolumenPerPlant: Volume;
  irrigationVolumenTotal: Volume;
  drainVolumenM2: Volume;
  drainVolumenPerPlant: Volume;
  drainPercentage: number;
  irrigationFlow: Volume;
  irrigationPrecipitation: Volume;
  cropProductionId: number;
}
```

---

## Main Function Implementation

```typescript
function calculateIrrigationCalculationOutput(
  inputs: IrrigationEventEntity[],
  cropProduction: CropProductionEntity,
  measurementVariables: MeasurementVariable[]
): IrrigationMetric {
  
  const output: IrrigationMetric = {} as IrrigationMetric;

  // Set date from first (current) irrigation event
  output.date = inputs[0].recordDateTime;

  // Calculate irrigation interval if previous event exists
  if (inputs.length > 1) {
    output.irrigationInterval = 
      inputs[0].dateTimeStart.getTime() - inputs[1].dateTimeEnd.getTime();
  }

  // Calculate irrigation length (duration)
  output.irrigationLength = 
    inputs[0].dateTimeEnd.getTime() - inputs[0].dateTimeStart.getTime();

  // Calculate densities (containers and plants per m²)
  const densityContainer = 
    1 / (cropProduction.betweenRowDistance * cropProduction.betweenContainerDistance);
  const densityPlant = 
    1 / (cropProduction.betweenRowDistance * cropProduction.betweenPlantDistance);

  // Find irrigation volume variable (StandardId = 19)
  const irrigationVolumeVariable = measurementVariables.find(
    x => x.measurementVariableStandardId === 19
  );

  if (!irrigationVolumeVariable) {
    throw new Error('Irrigation volume variable not found (StandardId = 19)');
  }

  // Calculate total irrigation volume
  const irrigationVolumen = inputs[0].irrigationMeasurements
    .filter(x => x.measurementVariableId === irrigationVolumeVariable.id)
    .reduce((sum, x) => sum + x.recordValue, 0);

  // Calculate irrigation volumes
  output.irrigationVolumenM2 = new Volume(
    irrigationVolumen * densityContainer,
    VolumeMeasure.toLitre
  );

  output.irrigationVolumenPerPlant = new Volume(
    output.irrigationVolumenM2.value / densityPlant,
    VolumeMeasure.toLitre
  );

  output.irrigationVolumenTotal = new Volume(
    cropProduction.area * output.irrigationVolumenM2.value,
    VolumeMeasure.toLitre
  );

  // Find drain volume variable (StandardId = 20)
  const drainVolumeVariable = measurementVariables.find(
    x => x.measurementVariableStandardId === 20
  );

  if (!drainVolumeVariable) {
    throw new Error('Drain volume variable not found (StandardId = 20)');
  }

  // Calculate total drain volume
  const drainVolumen = inputs[0].irrigationMeasurements
    .filter(x => x.measurementVariableId === drainVolumeVariable.id)
    .reduce((sum, x) => sum + x.recordValue, 0);

  // Calculate drain volumes and percentage
  output.drainVolumenM2 = new Volume(
    drainVolumen * densityContainer,
    VolumeMeasure.toLitre
  );

  output.drainVolumenPerPlant = new Volume(
    output.drainVolumenM2.value / densityPlant,
    VolumeMeasure.toLitre
  );

  output.drainPercentage = 
    (output.drainVolumenM2.value / output.irrigationVolumenM2.value) * 100;

  // Calculate irrigation flow rate (volume per hour)
  const irrigationLengthHours = output.irrigationLength / (1000 * 60 * 60);
  output.irrigationFlow = new Volume(
    irrigationVolumen / irrigationLengthHours,
    VolumeMeasure.toLitre
  );

  // Calculate irrigation precipitation rate (volume per m² per hour)
  output.irrigationPrecipitation = new Volume(
    output.irrigationVolumenM2.value / irrigationLengthHours,
    VolumeMeasure.none
  );

  // Set crop production ID
  output.cropProductionId = inputs[0].cropProductionId;

  return output;
}
```

---

## Alternative: Using TimeSpan Helper

For better readability with time calculations, you can add a helper:

```typescript
class TimeSpan {
  private milliseconds: number;

  constructor(milliseconds: number) {
    this.milliseconds = milliseconds;
  }

  static fromDates(start: Date, end: Date): TimeSpan {
    return new TimeSpan(end.getTime() - start.getTime());
  }

  get totalMilliseconds(): number {
    return this.milliseconds;
  }

  get totalSeconds(): number {
    return this.milliseconds / 1000;
  }

  get totalMinutes(): number {
    return this.milliseconds / (1000 * 60);
  }

  get totalHours(): number {
    return this.milliseconds / (1000 * 60 * 60);
  }

  get totalDays(): number {
    return this.milliseconds / (1000 * 60 * 60 * 24);
  }
}

// Updated interface with TimeSpan
interface IrrigationMetricWithTimeSpan {
  date: Date;
  irrigationInterval?: TimeSpan;
  irrigationLength: TimeSpan;
  // ... rest of the properties
}

// Refactored function using TimeSpan
function calculateIrrigationCalculationOutputWithTimeSpan(
  inputs: IrrigationEventEntity[],
  cropProduction: CropProductionEntity,
  measurementVariables: MeasurementVariable[]
): IrrigationMetricWithTimeSpan {
  
  const output: any = {};

  output.date = inputs[0].recordDateTime;

  // Calculate intervals using TimeSpan
  if (inputs.length > 1) {
    output.irrigationInterval = TimeSpan.fromDates(
      inputs[1].dateTimeEnd,
      inputs[0].dateTimeStart
    );
  }

  output.irrigationLength = TimeSpan.fromDates(
    inputs[0].dateTimeStart,
    inputs[0].dateTimeEnd
  );

  // Rest of calculations remain the same...
  const densityContainer = 
    1 / (cropProduction.betweenRowDistance * cropProduction.betweenContainerDistance);
  const densityPlant = 
    1 / (cropProduction.betweenRowDistance * cropProduction.betweenPlantDistance);

  const irrigationVolumeVariable = measurementVariables.find(
    x => x.measurementVariableStandardId === 19
  );

  if (!irrigationVolumeVariable) {
    throw new Error('Irrigation volume variable not found');
  }

  const irrigationVolumen = inputs[0].irrigationMeasurements
    .filter(x => x.measurementVariableId === irrigationVolumeVariable.id)
    .reduce((sum, x) => sum + x.recordValue, 0);

  output.irrigationVolumenM2 = new Volume(
    irrigationVolumen * densityContainer,
    VolumeMeasure.toLitre
  );

  output.irrigationVolumenPerPlant = new Volume(
    output.irrigationVolumenM2.value / densityPlant,
    VolumeMeasure.toLitre
  );

  output.irrigationVolumenTotal = new Volume(
    cropProduction.area * output.irrigationVolumenM2.value,
    VolumeMeasure.toLitre
  );

  const drainVolumeVariable = measurementVariables.find(
    x => x.measurementVariableStandardId === 20
  );

  if (!drainVolumeVariable) {
    throw new Error('Drain volume variable not found');
  }

  const drainVolumen = inputs[0].irrigationMeasurements
    .filter(x => x.measurementVariableId === drainVolumeVariable.id)
    .reduce((sum, x) => sum + x.recordValue, 0);

  output.drainVolumenM2 = new Volume(
    drainVolumen * densityContainer,
    VolumeMeasure.toLitre
  );

  output.drainVolumenPerPlant = new Volume(
    output.drainVolumenM2.value / densityPlant,
    VolumeMeasure.toLitre
  );

  output.drainPercentage = 
    (output.drainVolumenM2.value / output.irrigationVolumenM2.value) * 100;

  // Use TimeSpan for hour calculations
  output.irrigationFlow = new Volume(
    irrigationVolumen / output.irrigationLength.totalHours,
    VolumeMeasure.toLitre
  );

  output.irrigationPrecipitation = new Volume(
    output.irrigationVolumenM2.value / output.irrigationLength.totalHours,
    VolumeMeasure.none
  );

  output.cropProductionId = inputs[0].cropProductionId;

  return output as IrrigationMetricWithTimeSpan;
}
```

---

## Usage Example

```typescript
// Sample data
const irrigationEvents: IrrigationEventEntity[] = [
  {
    recordDateTime: new Date('2024-11-22T14:00:00'),
    dateTimeStart: new Date('2024-11-22T14:00:00'),
    dateTimeEnd: new Date('2024-11-22T14:30:00'),
    cropProductionId: 123,
    irrigationMeasurements: [
      { measurementVariableId: 1, recordValue: 5.0 },  // irrigation volume
      { measurementVariableId: 2, recordValue: 1.0 }   // drain volume
    ]
  },
  {
    recordDateTime: new Date('2024-11-22T08:00:00'),
    dateTimeStart: new Date('2024-11-22T08:00:00'),
    dateTimeEnd: new Date('2024-11-22T08:30:00'),
    cropProductionId: 123,
    irrigationMeasurements: []
  }
];

const cropProduction: CropProductionEntity = {
  betweenRowDistance: 2.0,
  betweenContainerDistance: 0.5,
  betweenPlantDistance: 0.25,
  area: 1000
};

const measurementVariables: MeasurementVariable[] = [
  { id: 1, measurementVariableStandardId: 19 }, // irrigation volume
  { id: 2, measurementVariableStandardId: 20 }  // drain volume
];

// Calculate metrics
const metrics = calculateIrrigationCalculationOutput(
  irrigationEvents,
  cropProduction,
  measurementVariables
);

console.log('Irrigation Metrics:', {
  date: metrics.date,
  intervalHours: metrics.irrigationInterval 
    ? metrics.irrigationInterval / (1000 * 60 * 60) 
    : null,
  lengthMinutes: metrics.irrigationLength / (1000 * 60),
  volumePerM2: metrics.irrigationVolumenM2.value,
  volumePerPlant: metrics.irrigationVolumenPerPlant.value,
  totalVolume: metrics.irrigationVolumenTotal.value,
  drainPercentage: metrics.drainPercentage,
  flowRate: metrics.irrigationFlow.value
});
```

---

## Key Differences from C#

1. **LINQ → Array Methods**: 
   - `Where()` → `filter()`
   - `Sum()` → `reduce()`
   - `FirstOrDefault()` → `find()`

2. **DateTime Operations**: JavaScript uses milliseconds (`.getTime()`) instead of C#'s TimeSpan

3. **Null Safety**: TypeScript uses optional chaining (`?`) and type guards

4. **Naming Conventions**: camelCase instead of PascalCase for properties

5. **Error Handling**: Explicit null checks and error throws for missing variables

This TypeScript version maintains the same logic and calculations as the C# original while following JavaScript/TypeScript conventions.