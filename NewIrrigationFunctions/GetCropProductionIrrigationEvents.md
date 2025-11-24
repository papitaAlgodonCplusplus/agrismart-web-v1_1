# Function Explanation: GetCropProductionIrrigationEvents

## Overview
This function **detects irrigation events** by analyzing pressure sensor readings from an irrigation pipeline. It identifies when pumps turn on (pressure increases) and turn off (pressure decreases) by monitoring pressure changes that exceed a threshold.

---

## Purpose
**Automated Irrigation Event Detection**: Instead of manually logging when irrigation occurs, this function automatically identifies irrigation events by analyzing pressure data from sensors in the irrigation system.

---

## Input Parameters

```csharp
CropProductionEntity cropProduction
```
- Contains crop production information (primarily used for the `Id`)

```csharp
IList<CalculationSetting> calculationSettings
```
- Configuration settings containing:
  - `InitialPressureMeasurementVariableId` - ID for storing initial pressure when pump starts
  - `MaximumPressureMeasurementVariableId` - ID for storing maximum pressure during event
  - `PressureDeltaThreshold` - Minimum pressure change to detect pump on/off (e.g., 5 PSI)

```csharp
IrrigationEvent inProgressIrrigationEvent
```
- An irrigation event that may have started before the current reading window
- Used to handle events that span multiple data collection periods
- If both dates are `DateTime.MinValue`, no event is in progress

```csharp
IList<MeasurementBase> readings
```
- Time-series pressure readings from the pipeline sensor
- Each reading has: `RecordDate` (timestamp) and `RecordValue` (pressure)

---

## Algorithm Flow

### **Step 1: Input Validation**
```csharp
if (readings == null || readings.Count < 2)
    return null;
```
Need at least 2 readings to compare pressure changes.

---

### **Step 2: Load Configuration Settings**
```csharp
CalculationSetting initialPressureSetting = calculationSettings
    .Where(x => x.Name == "InitialPressureMeasurementVariableId").FirstOrDefault();
CalculationSetting maximumPressureSetting = calculationSettings
    .Where(x => x.Name == "MaximumPressureMeasurementVariableId").FirstOrDefault();
CalculationSetting deltaPressure = calculationSettings
    .Where(x => x.Name == "PressureDeltaThreshold").FirstOrDefault();
```
Retrieves the measurement variable IDs and threshold value for pressure detection.

---

### **Step 3: Initialize State Variables**
```csharp
var result = new List<IrrigationEvent>();
bool isPumpOn = false;          // Tracks current pump state
double initialPressure = 0;     // Pressure when pump turned on
double maxPressure = 0;         // Maximum pressure during event
IrrigationEvent currentEvent = null;
```

---

### **Step 4: Handle In-Progress Events**
```csharp
if (!(inProgressIrrigationEvent.DateTimeStart == DateTime.MinValue && 
      inProgressIrrigationEvent.DateTimeEnd == DateTime.MinValue))
{
    isPumpOn = true;
    currentEvent = inProgressIrrigationEvent;
    
    IrrigationMeasurement maximumPressureMeasurement = inProgressIrrigationEvent
        .IrrigationEventMeasurements
        .Where(x => x.MeasurementVariableId == Convert.ToInt32(maximumPressureSetting.Value))
        .FirstOrDefault();
    
    if (maximumPressureMeasurement != null)
        initialPressure = maximumPressureMeasurement.RecordValue;
}
```

**Purpose**: If an irrigation event started in a previous data window and is still ongoing:
- Mark pump as already ON
- Continue tracking that event
- Retrieve the initial pressure from the previous event

---

### **Step 5: Process Pressure Readings**

Sort readings chronologically:
```csharp
IList<MeasurementBase> orderedReading = readings.OrderBy(x => x.RecordDate).ToList();
```

Loop through readings and compare consecutive values:
```csharp
for (int i = 1; i < orderedReading.Count; i++)
{
    double previous = orderedReading[i - 1].RecordValue;
    double current = orderedReading[i].RecordValue;
    double delta = current - previous;  // Pressure change
```

---

#### **Detection Logic: Pump Turn ON**

```csharp
if (!isPumpOn && delta >= deltaPressure.Value)
{
    // Pump just turned ON - pressure increased significantly
    
    if (currentEvent == null)
        currentEvent = new IrrigationEvent();

    currentEvent.Id = 0;
    currentEvent.CropProductionId = cropProduction.Id;
    currentEvent.DateTimeStart = orderedReading[i].RecordDate;
    currentEvent.RecordDateTime = orderedReading[i].RecordDate;

    IrrigationMeasurement initialPressureMeasurement = new IrrigationMeasurement
    {
        MeasurementVariableId = Convert.ToInt32(initialPressureSetting.Value),
        RecordValue = current
    };
    
    currentEvent.IrrigationEventMeasurements.Add(initialPressureMeasurement);
    isPumpOn = true;
    result.Add(currentEvent);
}
```

**When**: Pump was OFF and pressure increased by ≥ threshold  
**Action**:
1. Create new irrigation event
2. Record start time
3. Store initial pressure measurement
4. Mark pump as ON
5. Add event to results

**Example:**
```
Time: 10:00 AM, Pressure: 10 PSI
Time: 10:01 AM, Pressure: 45 PSI  ← Delta = +35 PSI (exceeds threshold)
→ PUMP TURNED ON, event starts at 10:01 AM
```

---

#### **Detection Logic: Pump Turn OFF**

```csharp
else if (isPumpOn && delta <= -deltaPressure.Value && currentEvent != null)
{
    // Pump just turned OFF - pressure decreased significantly
    
    currentEvent.DateTimeEnd = orderedReading[i].RecordDate;
    isPumpOn = false;

    IrrigationMeasurement MaximumPressureMeasurement = new IrrigationMeasurement
    {
        MeasurementVariableId = Convert.ToInt32(maximumPressureSetting.Value),
        RecordValue = maxPressure
    };

    currentEvent.IrrigationEventMeasurements.Add(MaximumPressureMeasurement);

    currentEvent = null;
    maxPressure = 0;
    current = 0;
}
```

**When**: Pump was ON and pressure decreased by ≥ threshold  
**Action**:
1. Record end time
2. Store maximum pressure observed during event
3. Mark pump as OFF
4. Reset tracking variables

**Example:**
```
Time: 10:25 AM, Pressure: 40 PSI
Time: 10:26 AM, Pressure: 12 PSI  ← Delta = -28 PSI (exceeds threshold)
→ PUMP TURNED OFF, event ends at 10:26 AM
```

---

#### **Track Maximum Pressure**

```csharp
if (current > maxPressure)
    maxPressure = current;
```

Continuously tracks the highest pressure reading during the irrigation event.

---

## Output

Returns `IList<IrrigationEvent>` containing:
- **Each detected irrigation event** with:
  - `DateTimeStart` - When pump turned on
  - `DateTimeEnd` - When pump turned off
  - `IrrigationEventMeasurements` - Contains initial and maximum pressure readings

---

## Example Scenario

### Pressure Data Stream:
```
10:00 AM → 10 PSI   (baseline)
10:01 AM → 12 PSI   
10:02 AM → 45 PSI   ← +33 PSI: PUMP ON detected (Event 1 starts)
10:03 AM → 48 PSI   
10:04 AM → 50 PSI   ← max pressure
10:05 AM → 47 PSI   
10:06 AM → 15 PSI   ← -32 PSI: PUMP OFF detected (Event 1 ends)
10:07 AM → 11 PSI   
10:08 AM → 42 PSI   ← +31 PSI: PUMP ON detected (Event 2 starts)
10:09 AM → 46 PSI   ← max pressure
10:10 AM → 13 PSI   ← -33 PSI: PUMP OFF detected (Event 2 ends)
```

### Detected Events (with threshold = 5 PSI):
```javascript
Event 1: {
  DateTimeStart: "10:02 AM",
  DateTimeEnd: "10:06 AM",
  InitialPressure: 45 PSI,
  MaximumPressure: 50 PSI,
  Duration: 4 minutes
}

Event 2: {
  DateTimeStart: "10:08 AM",
  DateTimeEnd: "10:10 AM",
  InitialPressure: 42 PSI,
  MaximumPressure: 46 PSI,
  Duration: 2 minutes
}
```

---

## Key Features

1. **Automatic Detection**: No manual logging needed
2. **Threshold-Based**: Configurable sensitivity via `PressureDeltaThreshold`
3. **Stateful Processing**: Handles events that span multiple data collection windows
4. **Noise Filtering**: Small pressure fluctuations below threshold are ignored
5. **Metadata Capture**: Records initial and maximum pressures for each event

---

## Potential Issues in Current Code

### ⚠️ Issue 1: Unused Variable
```csharp
double initialPressure = 0;  // Set but never used
```

### ⚠️ Issue 2: In-Progress Event Not Returned
If the loop ends while `isPumpOn = true`, the current event is never finalized and returned (it stays "in progress").

### ⚠️ Issue 3: Variable Reassignment
```csharp
current = 0;  // Why reset current? It's loop variable
```

---

## TypeScript Equivalent

```typescript
// Interfaces
interface MeasurementBase {
  recordDate: Date;
  recordValue: number;
}

interface CalculationSetting {
  name: string;
  value: string;
}

interface IrrigationMeasurement {
  measurementVariableId: number;
  recordValue: number;
}

interface IrrigationEvent {
  id: number;
  cropProductionId: number;
  recordDateTime: Date;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  irrigationEventMeasurements: IrrigationMeasurement[];
}

interface CropProductionEntity {
  id: number;
}

// Main Function
function getCropProductionIrrigationEvents(
  cropProduction: CropProductionEntity,
  calculationSettings: CalculationSetting[],
  inProgressIrrigationEvent: IrrigationEvent,
  readings: MeasurementBase[]
): IrrigationEvent[] | null {
  
  // Step 1: Validate input
  if (!readings || readings.length < 2) {
    return null;
  }

  // Step 2: Load configuration settings
  const initialPressureSetting = calculationSettings.find(
    x => x.name === "InitialPressureMeasurementVariableId"
  );
  const maximumPressureSetting = calculationSettings.find(
    x => x.name === "MaximumPressureMeasurementVariableId"
  );
  const deltaPressureSetting = calculationSettings.find(
    x => x.name === "PressureDeltaThreshold"
  );

  if (!initialPressureSetting || !maximumPressureSetting || !deltaPressureSetting) {
    throw new Error("Required calculation settings not found");
  }

  const deltaPressure = parseFloat(deltaPressureSetting.value);

  // Step 3: Initialize state variables
  const result: IrrigationEvent[] = [];
  let isPumpOn = false;
  let maxPressure = 0;
  let currentEvent: IrrigationEvent | null = null;

  // Step 4: Handle in-progress events
  const isInProgress = 
    inProgressIrrigationEvent.dateTimeStart.getTime() !== new Date(0).getTime() &&
    inProgressIrrigationEvent.dateTimeEnd.getTime() !== new Date(0).getTime();

  if (isInProgress) {
    isPumpOn = true;
    currentEvent = inProgressIrrigationEvent;
    
    const maximumPressureMeasurement = inProgressIrrigationEvent.irrigationEventMeasurements.find(
      x => x.measurementVariableId === parseInt(maximumPressureSetting.value)
    );
    
    if (maximumPressureMeasurement) {
      maxPressure = maximumPressureMeasurement.recordValue;
    }
  }

  // Step 5: Sort readings chronologically
  const orderedReadings = [...readings].sort(
    (a, b) => a.recordDate.getTime() - b.recordDate.getTime()
  );

  // Step 6: Process pressure readings
  for (let i = 1; i < orderedReadings.length; i++) {
    const previous = orderedReadings[i - 1].recordValue;
    const current = orderedReadings[i].recordValue;
    const delta = current - previous;

    // Pump Turn ON detection
    if (!isPumpOn && delta >= deltaPressure) {
      if (!currentEvent) {
        currentEvent = {
          id: 0,
          cropProductionId: cropProduction.id,
          recordDateTime: orderedReadings[i].recordDate,
          dateTimeStart: orderedReadings[i].recordDate,
          dateTimeEnd: new Date(0), // Will be set when pump turns off
          irrigationEventMeasurements: []
        };
      }

      const initialPressureMeasurement: IrrigationMeasurement = {
        measurementVariableId: parseInt(initialPressureSetting.value),
        recordValue: current
      };

      currentEvent.irrigationEventMeasurements.push(initialPressureMeasurement);
      isPumpOn = true;
      result.push(currentEvent);
    }
    // Pump Turn OFF detection
    else if (isPumpOn && delta <= -deltaPressure && currentEvent !== null) {
      currentEvent.dateTimeEnd = orderedReadings[i].recordDate;
      isPumpOn = false;

      const maximumPressureMeasurement: IrrigationMeasurement = {
        measurementVariableId: parseInt(maximumPressureSetting.value),
        recordValue: maxPressure
      };

      currentEvent.irrigationEventMeasurements.push(maximumPressureMeasurement);

      currentEvent = null;
      maxPressure = 0;
    }

    // Track maximum pressure during event
    if (current > maxPressure) {
      maxPressure = current;
    }
  }

  return result;
}

// Helper function to check if event is in progress
function isEventInProgress(event: IrrigationEvent): boolean {
  const minDate = new Date(0).getTime();
  return (
    event.dateTimeStart.getTime() !== minDate ||
    event.dateTimeEnd.getTime() !== minDate
  );
}

// Usage Example
const cropProduction: CropProductionEntity = { id: 123 };

const calculationSettings: CalculationSetting[] = [
  { name: "InitialPressureMeasurementVariableId", value: "1" },
  { name: "MaximumPressureMeasurementVariableId", value: "2" },
  { name: "PressureDeltaThreshold", value: "5.0" } // 5 PSI threshold
];

const inProgressEvent: IrrigationEvent = {
  id: 0,
  cropProductionId: 0,
  recordDateTime: new Date(0),
  dateTimeStart: new Date(0),
  dateTimeEnd: new Date(0),
  irrigationEventMeasurements: []
};

const pressureReadings: MeasurementBase[] = [
  { recordDate: new Date("2024-11-22T10:00:00"), recordValue: 10 },
  { recordDate: new Date("2024-11-22T10:01:00"), recordValue: 12 },
  { recordDate: new Date("2024-11-22T10:02:00"), recordValue: 45 }, // Pump ON
  { recordDate: new Date("2024-11-22T10:03:00"), recordValue: 48 },
  { recordDate: new Date("2024-11-22T10:04:00"), recordValue: 50 }, // Max
  { recordDate: new Date("2024-11-22T10:05:00"), recordValue: 47 },
  { recordDate: new Date("2024-11-22T10:06:00"), recordValue: 15 }  // Pump OFF
];

const events = getCropProductionIrrigationEvents(
  cropProduction,
  calculationSettings,
  inProgressEvent,
  pressureReadings
);

console.log("Detected Events:", events);

// Output:
// Detected Events: [
//   {
//     id: 0,
//     cropProductionId: 123,
//     dateTimeStart: "2024-11-22T10:02:00",
//     dateTimeEnd: "2024-11-22T10:06:00",
//     irrigationEventMeasurements: [
//       { measurementVariableId: 1, recordValue: 45 },  // Initial
//       { measurementVariableId: 2, recordValue: 50 }   // Maximum
//     ]
//   }
// ]
```

---

## Enhanced TypeScript Version with Better Error Handling

```typescript
interface IrrigationEventDetectionResult {
  events: IrrigationEvent[];
  inProgressEvent: IrrigationEvent | null;
}

function getCropProductionIrrigationEventsEnhanced(
  cropProduction: CropProductionEntity,
  calculationSettings: CalculationSetting[],
  inProgressIrrigationEvent: IrrigationEvent | null,
  readings: MeasurementBase[]
): IrrigationEventDetectionResult {
  
  // Validate input
  if (!readings || readings.length < 2) {
    return { events: [], inProgressEvent: null };
  }

  // Load settings with error handling
  const getSetting = (name: string): CalculationSetting => {
    const setting = calculationSettings.find(x => x.name === name);
    if (!setting) {
      throw new Error(`Required setting '${name}' not found`);
    }
    return setting;
  };

  const initialPressureSetting = getSetting("InitialPressureMeasurementVariableId");
  const maximumPressureSetting = getSetting("MaximumPressureMeasurementVariableId");
  const deltaPressureSetting = getSetting("PressureDeltaThreshold");
  const deltaPressure = parseFloat(deltaPressureSetting.value);

  const result: IrrigationEvent[] = [];
  let isPumpOn = false;
  let maxPressure = 0;
  let currentEvent: IrrigationEvent | null = null;

  // Handle in-progress events
  if (inProgressIrrigationEvent && isEventInProgress(inProgressIrrigationEvent)) {
    isPumpOn = true;
    currentEvent = { ...inProgressIrrigationEvent }; // Clone to avoid mutation
    
    const maxPressureMeasurement = currentEvent.irrigationEventMeasurements.find(
      x => x.measurementVariableId === parseInt(maximumPressureSetting.value)
    );
    
    if (maxPressureMeasurement) {
      maxPressure = maxPressureMeasurement.recordValue;
    }
  }

  // Sort and process readings
  const orderedReadings = [...readings].sort(
    (a, b) => a.recordDate.getTime() - b.recordDate.getTime()
  );

  for (let i = 1; i < orderedReadings.length; i++) {
    const previous = orderedReadings[i - 1].recordValue;
    const current = orderedReadings[i].recordValue;
    const delta = current - previous;

    // Pump ON
    if (!isPumpOn && delta >= deltaPressure) {
      currentEvent = createNewEvent(
        cropProduction.id,
        orderedReadings[i].recordDate,
        parseInt(initialPressureSetting.value),
        current
      );
      
      isPumpOn = true;
      result.push(currentEvent);
    }
    // Pump OFF
    else if (isPumpOn && delta <= -deltaPressure && currentEvent) {
      currentEvent.dateTimeEnd = orderedReadings[i].recordDate;
      
      currentEvent.irrigationEventMeasurements.push({
        measurementVariableId: parseInt(maximumPressureSetting.value),
        recordValue: maxPressure
      });

      isPumpOn = false;
      currentEvent = null;
      maxPressure = 0;
    }

    // Track max pressure
    if (current > maxPressure) {
      maxPressure = current;
    }
  }

  // Return events and any in-progress event
  return {
    events: result,
    inProgressEvent: isPumpOn ? currentEvent : null
  };
}

function createNewEvent(
  cropProductionId: number,
  startDate: Date,
  initialPressureVariableId: number,
  initialPressureValue: number
): IrrigationEvent {
  return {
    id: 0,
    cropProductionId,
    recordDateTime: startDate,
    dateTimeStart: startDate,
    dateTimeEnd: new Date(0),
    irrigationEventMeasurements: [
      {
        measurementVariableId: initialPressureVariableId,
        recordValue: initialPressureValue
      }
    ]
  };
}
``` 