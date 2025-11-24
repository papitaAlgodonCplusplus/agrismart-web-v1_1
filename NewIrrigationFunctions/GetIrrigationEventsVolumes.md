# Function Explanation: GetIrrigationEventsVolumes

## Overview
This function **calculates the total water volume** applied and drained for each irrigation event by analyzing flow meter readings. It processes sensor data from water input (irrigation) and water drain sensors to determine how much water was used and how much drained away during each irrigation event.

---

## Purpose
**Volume Calculation from Flow Meters**: Transforms cumulative flow meter readings into actual volumes by calculating the difference between maximum and minimum readings during each irrigation event window.

---

## Input Parameters

```csharp
IList<IrrigationEvent> irrigationEvents
```
- List of detected irrigation events (from the previous function)
- Each event has `DateTimeStart` and `DateTimeEnd`

```csharp
IList<MeasurementBase> waterInputs
```
- Time-series readings from **irrigation flow meters**
- Cumulative water volume readings (e.g., total liters passed through meter)
- Each reading: `RecordDate`, `RecordValue`, `SensorId`

```csharp
IList<MeasurementBase> waterDrains
```
- Time-series readings from **drain flow meters**
- Cumulative drainage volume readings
- Each reading: `RecordDate`, `RecordValue`, `SensorId`

```csharp
IList<CalculationSetting> calculationSettings
```
- Configuration containing measurement variable IDs:
  - `IrrigationVolume` - ID for storing irrigation volume
  - `DrainVolume` - ID for storing drain volume

```csharp
DateTime localTime
```
- Current local time
- Used for events still in progress (no end time yet)

---

## Algorithm Flow

### **Step 1: Load Configuration**
```csharp
CalculationSetting irrigationVolumenMeasurementVariableId = calculationSettings
    .Where(x => x.Name == "IrrigationVolume").FirstOrDefault();
CalculationSetting drainVolumenMeasurementVariableId = calculationSettings
    .Where(x => x.Name == "DrainVolume").FirstOrDefault();
```
Gets the measurement variable IDs for storing calculated volumes.

---

### **Step 2: Sort Events Chronologically**
```csharp
IList<IrrigationEvent> orderedIrrigationEvents = irrigationEvents
    .OrderBy(x => x.DateTimeStart).ToList();
```
Ensures events are processed in time order.

---

### **Step 3: Process Each Irrigation Event**

For each event, calculate both irrigation and drain volumes:

```csharp
for (int i = 0; i < orderedIrrigationEvents.Count; i++)
{
    // Process each event...
}
```

---

### **Step 3a: Determine Event Time Window**

```csharp
DateTime limitDateTime = orderedIrrigationEvents[i].DateTimeEnd;

if (orderedIrrigationEvents[i].DateTimeEnd == DateTime.MinValue)
{
    limitDateTime = localTime;
}
```

**Purpose**: Handle in-progress events that don't have an end time yet.
- If event has ended: use `DateTimeEnd`
- If event is still running: use current `localTime`

---

### **Step 3b: Calculate Irrigation Volume**

#### Filter Readings for Event Window
```csharp
IList<MeasurementBase> irrigationEventWaterInputs = waterInputs
    .Where(x => x.RecordDate >= orderedIrrigationEvents[i].DateTimeStart && 
                x.RecordDate <= limitDateTime)
    .OrderBy(x => x.RecordDate)
    .ToList();
```

Gets all water input readings during the irrigation event.

#### Calculate Volume Per Sensor
```csharp
var irrigatedPerSensor = irrigationEventWaterInputs
    .GroupBy(x => x.SensorId)
    .Select(g => new
    {
        Sensor = g.Key,
        TotalIrrigated = g.Max(x => x.RecordValue) - g.Min(x => x.RecordValue)
    })
    .ToList();
```

**Key Insight**: Flow meters typically provide **cumulative readings**. To get volume used:
```
Volume = Maximum Reading - Minimum Reading
```

**Example for Sensor 1:**
```
10:02 AM → 1000 L (cumulative)
10:03 AM → 1050 L
10:04 AM → 1100 L
10:05 AM → 1150 L
10:06 AM → 1200 L

Volume Used = 1200 - 1000 = 200 L
```

#### Average Across All Sensors
```csharp
double irrigationVolume = irrigatedPerSensor.Any()
    ? irrigatedPerSensor.Average(x => x.TotalIrrigated)
    : 0;
```

If multiple sensors exist (e.g., multiple irrigation lines), average their readings.

#### Store Result
```csharp
IrrigationMeasurement totalIrrigationVolumeMeasurement = new IrrigationMeasurement
{
    MeasurementVariableId = Convert.ToInt32(irrigationVolumenMeasurementVariableId.Value),
    RecordValue = irrigationVolume
};

orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(totalIrrigationVolumeMeasurement);
```

Adds the calculated irrigation volume to the event's measurements.

---

### **Step 3c: Calculate Drain Volume**

⚠️ **Bug Alert**: This section has a critical bug!

```csharp
DateTime drainLimitDateTime = localTime;

if ((i + 1) < orderedIrrigationEvents.Count)
{
    drainLimitDateTime = orderedIrrigationEvents[1 + 1].DateTimeStart.AddMinutes(-1);
    //                                          ^^^^^^ BUG! Should be [i + 1]
}
```

**Intended Logic**: Drainage continues after irrigation stops, so calculate drain volume from event start until:
- 1 minute before the next irrigation starts, OR
- Current time if this is the last event

**Bug**: Uses `[1 + 1]` (always index 2) instead of `[i + 1]` (next event)

#### Filter Drain Readings
```csharp
IList<MeasurementBase> irrigationEventDrains = waterDrains
    .Where(x => x.RecordDate >= orderedIrrigationEvents[i].DateTimeStart && 
                x.RecordDate <= limitDateTime)  // ⚠️ Uses wrong limitDateTime
    .OrderBy(x => x.RecordDate)
    .ToList();
```

Should use `drainLimitDateTime` but uses `limitDateTime` instead (irrigation end time).

#### Calculate Volume Per Sensor (Same Logic as Irrigation)
```csharp
var drainPerSensor = irrigationEventDrains
    .GroupBy(x => x.SensorId)
    .Select(g => new
    {
        Sensor = g.Key,
        TotalDrained = g.Max(x => x.RecordValue) - g.Min(x => x.RecordValue)
    })
    .ToList();

double drainedVolume = drainPerSensor.Any()
    ? drainPerSensor.Average(x => x.TotalDrained)
    : 0;
```

#### Store Result
```csharp
IrrigationMeasurement totalDrainVolumeMeasurement = new IrrigationMeasurement
{
    MeasurementVariableId = Convert.ToInt32(drainVolumenMeasurementVariableId.Value),
    RecordValue = drainedVolume
};

orderedIrrigationEvents[i].IrrigationEventMeasurements.Add(totalDrainVolumeMeasurement);
```

---

## Complete Example Scenario

### Input Data:

**Irrigation Events:**
```javascript
Event 1: 10:02 AM - 10:06 AM
Event 2: 11:00 AM - 11:05 AM
```

**Water Input Sensor Readings (Cumulative):**
```
Sensor A:
10:00 AM → 1000 L
10:02 AM → 1000 L  ← Event 1 starts
10:03 AM → 1050 L
10:04 AM → 1100 L
10:05 AM → 1150 L
10:06 AM → 1200 L  ← Event 1 ends
10:30 AM → 1200 L
11:00 AM → 1200 L  ← Event 2 starts
11:02 AM → 1280 L
11:05 AM → 1350 L  ← Event 2 ends

Sensor B:
10:02 AM → 500 L   ← Event 1 starts
10:06 AM → 700 L   ← Event 1 ends
11:00 AM → 700 L   ← Event 2 starts
11:05 AM → 850 L   ← Event 2 ends
```

**Water Drain Sensor Readings (Cumulative):**
```
Drain Sensor 1:
10:02 AM → 100 L   ← Event 1 starts
10:10 AM → 130 L   ← Drainage continues after irrigation
11:00 AM → 130 L   ← Event 2 starts
11:08 AM → 155 L
```

### Calculations:

#### Event 1 Irrigation Volume:
```
Sensor A: 1200 - 1000 = 200 L
Sensor B: 700 - 500 = 200 L
Average: (200 + 200) / 2 = 200 L
```

#### Event 1 Drain Volume:
```
Drain Sensor 1: 130 - 100 = 30 L
Drain Percentage: (30 / 200) × 100 = 15%
```

#### Event 2 Irrigation Volume:
```
Sensor A: 1350 - 1200 = 150 L
Sensor B: 850 - 700 = 150 L
Average: (150 + 150) / 2 = 150 L
```

#### Event 2 Drain Volume:
```
Drain Sensor 1: 155 - 130 = 25 L
Drain Percentage: (25 / 150) × 100 = 16.7%
```

---

## Output

Returns the same `irrigationEvents` list, but each event now has two additional measurements:
1. **Irrigation Volume** - Total water applied during event
2. **Drain Volume** - Total water drained during/after event

---

## Identified Bugs

### 🐛 Bug #1: Wrong Array Index
```csharp
drainLimitDateTime = orderedIrrigationEvents[1 + 1].DateTimeStart.AddMinutes(-1);
//                                           ^^^^^^ Should be [i + 1]
```

### 🐛 Bug #2: Wrong Limit DateTime for Drains
```csharp
IList<MeasurementBase> irrigationEventDrains = waterDrains
    .Where(x => x.RecordDate >= orderedIrrigationEvents[i].DateTimeStart && 
                x.RecordDate <= limitDateTime)  // Should be drainLimitDateTime
```

### 🐛 Bug #3: Unused Variable
The corrected `drainLimitDateTime` is calculated but never used due to Bug #2.

---

## TypeScript Equivalent (Bug-Fixed Version)

```typescript
// Interfaces
interface MeasurementBase {
  recordDate: Date;
  recordValue: number;
  sensorId: number;
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

// Main Function (with bugs fixed)
function getIrrigationEventsVolumes(
  irrigationEvents: IrrigationEvent[],
  waterInputs: MeasurementBase[],
  waterDrains: MeasurementBase[],
  calculationSettings: CalculationSetting[],
  localTime: Date
): IrrigationEvent[] {
  
  // Step 1: Load configuration
  const irrigationVolumeSetting = calculationSettings.find(
    x => x.name === "IrrigationVolume"
  );
  const drainVolumeSetting = calculationSettings.find(
    x => x.name === "DrainVolume"
  );

  if (!irrigationVolumeSetting || !drainVolumeSetting) {
    throw new Error("Required volume measurement settings not found");
  }

  // Step 2: Sort events chronologically
  const orderedEvents = [...irrigationEvents].sort(
    (a, b) => a.dateTimeStart.getTime() - b.dateTimeStart.getTime()
  );

  // Step 3: Process each event
  for (let i = 0; i < orderedEvents.length; i++) {
    const event = orderedEvents[i];
    
    // Step 3a: Determine event end time
    const minDate = new Date(0).getTime();
    const limitDateTime = event.dateTimeEnd.getTime() === minDate
      ? localTime
      : event.dateTimeEnd;

    // Step 3b: Calculate irrigation volume
    const irrigationVolume = calculateVolume(
      waterInputs,
      event.dateTimeStart,
      limitDateTime
    );

    // Add irrigation volume measurement
    event.irrigationEventMeasurements.push({
      measurementVariableId: parseInt(irrigationVolumeSetting.value),
      recordValue: irrigationVolume
    });

    // Step 3c: Calculate drain volume
    // Drainage continues after irrigation stops, until next event or current time
    let drainLimitDateTime = localTime;
    
    if (i + 1 < orderedEvents.length) {
      // Fixed: Use [i + 1] instead of [1 + 1]
      const nextEventStart = orderedEvents[i + 1].dateTimeStart;
      drainLimitDateTime = new Date(nextEventStart.getTime() - 60000); // -1 minute
    }

    // Fixed: Use drainLimitDateTime instead of limitDateTime
    const drainVolume = calculateVolume(
      waterDrains,
      event.dateTimeStart,
      drainLimitDateTime
    );

    // Add drain volume measurement
    event.irrigationEventMeasurements.push({
      measurementVariableId: parseInt(drainVolumeSetting.value),
      recordValue: drainVolume
    });
  }

  return orderedEvents;
}

// Helper function to calculate volume from sensor readings
function calculateVolume(
  measurements: MeasurementBase[],
  startTime: Date,
  endTime: Date
): number {
  
  // Filter measurements within time window
  const filteredMeasurements = measurements.filter(
    m => m.recordDate >= startTime && m.recordDate <= endTime
  );

  if (filteredMeasurements.length === 0) {
    return 0;
  }

  // Group by sensor and calculate volume per sensor
  const volumePerSensor = groupBySensor(filteredMeasurements);

  // Average across all sensors
  const volumes = Array.from(volumePerSensor.values());
  return volumes.length > 0
    ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length
    : 0;
}

// Helper function to group measurements by sensor and calculate volume
function groupBySensor(measurements: MeasurementBase[]): Map<number, number> {
  const grouped = new Map<number, MeasurementBase[]>();

  // Group by sensorId
  measurements.forEach(m => {
    if (!grouped.has(m.sensorId)) {
      grouped.set(m.sensorId, []);
    }
    grouped.get(m.sensorId)!.push(m);
  });

  // Calculate volume for each sensor (max - min)
  const volumePerSensor = new Map<number, number>();
  
  grouped.forEach((sensorMeasurements, sensorId) => {
    const values = sensorMeasurements.map(m => m.recordValue);
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);
    const volume = maxValue - minValue;
    
    volumePerSensor.set(sensorId, volume);
  });

  return volumePerSensor;
}

// Usage Example
const irrigationEvents: IrrigationEvent[] = [
  {
    id: 1,
    cropProductionId: 123,
    recordDateTime: new Date("2024-11-22T10:02:00"),
    dateTimeStart: new Date("2024-11-22T10:02:00"),
    dateTimeEnd: new Date("2024-11-22T10:06:00"),
    irrigationEventMeasurements: [
      { measurementVariableId: 1, recordValue: 45 } // Initial pressure
    ]
  },
  {
    id: 2,
    cropProductionId: 123,
    recordDateTime: new Date("2024-11-22T11:00:00"),
    dateTimeStart: new Date("2024-11-22T11:00:00"),
    dateTimeEnd: new Date("2024-11-22T11:05:00"),
    irrigationEventMeasurements: [
      { measurementVariableId: 1, recordValue: 42 }
    ]
  }
];

const waterInputReadings: MeasurementBase[] = [
  // Sensor A
  { recordDate: new Date("2024-11-22T10:00:00"), recordValue: 1000, sensorId: 1 },
  { recordDate: new Date("2024-11-22T10:02:00"), recordValue: 1000, sensorId: 1 },
  { recordDate: new Date("2024-11-22T10:03:00"), recordValue: 1050, sensorId: 1 },
  { recordDate: new Date("2024-11-22T10:06:00"), recordValue: 1200, sensorId: 1 },
  { recordDate: new Date("2024-11-22T11:00:00"), recordValue: 1200, sensorId: 1 },
  { recordDate: new Date("2024-11-22T11:05:00"), recordValue: 1350, sensorId: 1 },
  
  // Sensor B
  { recordDate: new Date("2024-11-22T10:02:00"), recordValue: 500, sensorId: 2 },
  { recordDate: new Date("2024-11-22T10:06:00"), recordValue: 700, sensorId: 2 },
  { recordDate: new Date("2024-11-22T11:00:00"), recordValue: 700, sensorId: 2 },
  { recordDate: new Date("2024-11-22T11:05:00"), recordValue: 850, sensorId: 2 }
];

const waterDrainReadings: MeasurementBase[] = [
  { recordDate: new Date("2024-11-22T10:02:00"), recordValue: 100, sensorId: 3 },
  { recordDate: new Date("2024-11-22T10:10:00"), recordValue: 130, sensorId: 3 },
  { recordDate: new Date("2024-11-22T11:00:00"), recordValue: 130, sensorId: 3 },
  { recordDate: new Date("2024-11-22T11:08:00"), recordValue: 155, sensorId: 3 }
];

const calculationSettings: CalculationSetting[] = [
  { name: "IrrigationVolume", value: "10" },
  { name: "DrainVolume", value: "11" }
];

const localTime = new Date("2024-11-22T12:00:00");

const eventsWithVolumes = getIrrigationEventsVolumes(
  irrigationEvents,
  waterInputReadings,
  waterDrainReadings,
  calculationSettings,
  localTime
);

console.log("Events with volumes:", JSON.stringify(eventsWithVolumes, null, 2));

// Output:
// Event 1: Irrigation = 200L, Drain = 30L (15% drain)
// Event 2: Irrigation = 150L, Drain = 25L (16.7% drain)
```

---

## Enhanced Version with Better Structure

```typescript
interface VolumeCalculationResult {
  volume: number;
  sensorCount: number;
  sensorVolumes: Map<number, number>;
}

function calculateVolumeDetailed(
  measurements: MeasurementBase[],
  startTime: Date,
  endTime: Date
): VolumeCalculationResult {
  
  const filteredMeasurements = measurements.filter(
    m => m.recordDate >= startTime && m.recordDate <= endTime
  );

  const volumePerSensor = groupBySensor(filteredMeasurements);
  const volumes = Array.from(volumePerSensor.values());
  
  const averageVolume = volumes.length > 0
    ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length
    : 0;

  return {
    volume: averageVolume,
    sensorCount: volumePerSensor.size,
    sensorVolumes: volumePerSensor
  };
}

// Usage with detailed results
function getIrrigationEventsVolumesDetailed(
  irrigationEvents: IrrigationEvent[],
  waterInputs: MeasurementBase[],
  waterDrains: MeasurementBase[],
  calculationSettings: CalculationSetting[],
  localTime: Date
): IrrigationEvent[] {
  
  const irrigationVolumeSetting = calculationSettings.find(
    x => x.name === "IrrigationVolume"
  );
  const drainVolumeSetting = calculationSettings.find(
    x => x.name === "DrainVolume"
  );

  if (!irrigationVolumeSetting || !drainVolumeSetting) {
    throw new Error("Required settings not found");
  }

  const orderedEvents = [...irrigationEvents].sort(
    (a, b) => a.dateTimeStart.getTime() - b.dateTimeStart.getTime()
  );

  orderedEvents.forEach((event, i) => {
    const limitDateTime = event.dateTimeEnd.getTime() === new Date(0).getTime()
      ? localTime
      : event.dateTimeEnd;

    // Calculate irrigation volume
    const irrigationResult = calculateVolumeDetailed(
      waterInputs,
      event.dateTimeStart,
      limitDateTime
    );

    event.irrigationEventMeasurements.push({
      measurementVariableId: parseInt(irrigationVolumeSetting.value),
      recordValue: irrigationResult.volume
    });

    console.log(`Event ${i + 1} Irrigation: ${irrigationResult.volume}L from ${irrigationResult.sensorCount} sensors`);

    // Calculate drain volume
    let drainLimitDateTime = localTime;
    if (i + 1 < orderedEvents.length) {
      drainLimitDateTime = new Date(
        orderedEvents[i + 1].dateTimeStart.getTime() - 60000
      );
    }

    const drainResult = calculateVolumeDetailed(
      waterDrains,
      event.dateTimeStart,
      drainLimitDateTime
    );

    event.irrigationEventMeasurements.push({
      measurementVariableId: parseInt(drainVolumeSetting.value),
      recordValue: drainResult.volume
    });

    console.log(`Event ${i + 1} Drain: ${drainResult.volume}L from ${drainResult.sensorCount} sensors`);
    
    if (irrigationResult.volume > 0) {
      const drainPercentage = (drainResult.volume / irrigationResult.volume) * 100;
      console.log(`Event ${i + 1} Drain Percentage: ${drainPercentage.toFixed(1)}%`);
    }
  });

  return orderedEvents;
}
```