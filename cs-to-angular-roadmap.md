# C# → Angular Irrigation Roadmap

> Based on gap analysis between `IrrigationCalculations.cs`, `IrrigationEventProcess.cs`,
> `IrrigationMonitor.cs`, `KPIsCalculations.cs`, `KPIsCalculator.cs` and the current Angular services.

---

## Phase 1 — Critical Fixes (Blocking)

These produce **wrong output right now** and must be fixed before anything else.

---

### TODO 1.1 — Fix `volumeM2` formula (inverted)

**File**: `src/app/features/services/irrigation-calculations.service.ts` ~line 128

**Problem**: Angular divides by area (`volume / area`) when C# multiplies by density (`volume × densityContainer`). Both should yield the same unit (L/m²), but the values are completely different because `densityContainer = 1 / (rowDist × containerDist)` is not the same as `1 / area`.

**How to fix**:
```ts
// WRONG
const irrigationVolumeM2 = irrigationVolumeTotal / cropProduction.area;

// CORRECT — density is already calculated a few lines above
const irrigationVolumeM2 = irrigationVolumeTotal * densityContainer;
```
Apply the same correction to `drainVolumeM2`. All downstream values (per-plant, precipitation) will then auto-correct since they consume `volumeM2`.

---

### TODO 1.2 — Implement humidity setpoint calculation

**File**: `src/app/features/services/irrigation-decision-engine.service.ts`

**Problem**: The on-demand decision trigger is comparing soil moisture against a hardcoded or arbitrary target. The C# defines a proper agronomic setpoint:
```
setPoint = ContainerCapacity% − (TotalAvailableWater% × Depletion% / 100)
```
Example: CC=40%, TAW=20%, Depletion=50% → setPoint = 40 − 10 = **30%**

**How to fix**: Before calling `toIrrigate()`, compute the setpoint from the crop production's growing medium properties and pass it as `targetMoisture`. The `GrowingMedium` entity already carries `containerCapacityPercentage`, `totalAvailableWaterPercentage`, and `cropProduction.depletionPercentage`.

```ts
const setPoint = growingMedium.containerCapacityPercentage
  - (growingMedium.totalAvailableWaterPercentage * (cropProduction.depletionPercentage / 100));
```

---

### TODO 1.3 — Wire dropper config into irrigation time calculation

**File**: `src/app/features/services/irrigation-calculations.service.ts` ~line 430

**Problem**: Angular hardcodes `const flowRate = 2` L/min. C# derives the actual flow from:
```
flowRatePerContainer = dropper.FlowRate × numberOfDroppersPerContainer
irrigationMinutes    = totalVolume / flowRatePerContainer × 60
```

**How to fix**: `CropProductionEntity` should expose `dropper.flowRate` and `numberOfDroppersPerContainer`. Use those instead of the constant. If the dropper is not loaded on the entity, add it to the API call that fetches crop production.

---

### TODO 1.4 — Replace hardcoded decision threshold with setpoint comparison

**File**: `src/app/features/services/irrigation-calculations.service.ts` → `toIrrigate()`

**Problem**: Angular triggers irrigation when `depletionPercentage >= 50%` (a derived %). C# triggers when `measuredMoisture < setPoint` (absolute comparison). These are conceptually different and will fire at different moments.

**How to fix**: After implementing TODO 1.2, change the decision condition:
```ts
// WRONG — depletion % threshold
const shouldIrrigate = depletionPercentage >= depletionThreshold;

// CORRECT — absolute moisture vs agronomic setpoint
const shouldIrrigate = currentSoilMoisture < setPoint;
```
Keep the depletion % as a display metric but not as the trigger.

---

## Phase 2 — On-Demand Volume Calculation (High Priority)

The full C# volume logic in `IrrigationMonitor.cs` has two distinct cases that Angular does not implement at all.

---

### TODO 2.1 — Implement depletion-changed volume calculation

**File**: `src/app/features/services/irrigation-decision-engine.service.ts`

**When it applies**: User changed the depletion % since the last irrigation event, or there is no prior event.

**C# formula**:
```
totalAvailableWaterVol       = containerVolume × (TAW% / 100)
totalDepletionPercentage     = ContainerCapacity% − measuredMoisture%
availableDepletionPercentage = (totalDepletion% / TAW%) × 100
waterConsumption             = totalAvailableWaterVol × availableDepletion% / 100
drainVolume                  = waterConsumption × (DrainThreshold% / 100)
totalIrrigationVolume        = waterConsumption + drainVolume
```

**How to proceed**: Create a method `calculateIrrigationVolume(cropProduction, measuredMoisture)` that runs this formula when `cropProduction.depletionPercentage !== lastEvent.depletionPercentage` (or no last event exists). All inputs are already on `cropProduction` and `growingMedium`.

---

### TODO 2.2 — Implement drain-adjustment volume calculation

**File**: `src/app/features/services/irrigation-decision-engine.service.ts`

**When it applies**: Depletion % is the same as the previous event — volume is fine-tuned by comparing actual vs target drain.

**C# formula**:
```
previousDrainPercentage  = (previousDrainVolume / previousIrrigationVolume) × 100
drainDifference%         = DrainThreshold% − previousDrainPercentage
irrigationAdjustment     = previousIrrigationVolume × (drainDifference% / 100)
totalIrrigationVolume    = previousIrrigationVolume + irrigationAdjustment
```

**How to proceed**: Extend `calculateIrrigationVolume()` with an `else` branch that reads the most recent stored irrigation event's volume and drain volume, then applies the adjustment. The history is already tracked by the auto-monitor service — expose the last event from there.

---

## Phase 3 — Configuration Loading (High Priority)

All thresholds are hardcoded in Angular. C# loads them from a `CalculationSettings` table.

---

### TODO 3.1 — Create `CalculationSettingsService`

**New file**: `src/app/features/services/calculation-settings.service.ts`

**How to proceed**: Add an API endpoint (or reuse an existing settings endpoint) that returns key-value pairs from the `CalculationSettings` table. The service fetches them on app init (or on first use) and exposes them as a map:
```ts
getSetting(name: string): number
```
Keys to support initially: `PressureDeltaThreshold`, `IrrigationPressureThreshold`, `MaxVolumetricWaterContentLastReadingDelayMinutes`, `MaxElectroConductivityLastReadingDelayMinutes`.

---

### TODO 3.2 — Replace hardcoded thresholds with settings lookups

**Files**: `irrigation-calculations.service.ts`, `irrigation-decision-engine.service.ts`

**How to proceed**: Inject `CalculationSettingsService` into both services. Replace:
- `pressureDeltaThreshold = 0.002` → `settings.getSetting('PressureDeltaThreshold')`
- `depletionThreshold = 40` → driven by `cropProduction.depletionPercentage` (already agronomic)
- `flowRate = 2` → dropper config (TODO 1.3)

---

### TODO 3.3 — Replace hardcoded measurement variable IDs

**File**: `src/app/features/services/irrigation-calculations.service.ts`

**Problem**: Measurement variable IDs are stored as `id: 1`, `id: 2` etc. C# maps them via named settings like `IrrigationVolumenM2MeasurementVariableId`.

**How to proceed**: Load the full set of variable ID mappings from `CalculationSettings` and build a local lookup object. Use named constants in Angular code instead of raw numbers:
```ts
const VAR = await this.settingsService.getMeasurementVariableIds();
{ measurementVariableId: VAR.irrigationVolumeM2, recordValue: ... }
```

---

## Phase 4 — KPI Calculations (Medium Priority)

---

### TODO 4.1 — Implement Degree Days

**File**: `src/app/features/services/calculations/kpi-orchestrator.service.ts`

**C# formula** (KPIsCalculations.cs):
```
degreesDay = ((TempMax + TempMin) / 2) − cropBaseTemperature
```
Note: the C# source has a parenthesis anomaly — verify with the agronomy team whether it is `(TempMax + TempMin) / 2` or `TempMax + (TempMin / 2)` before implementing.

**How to proceed**: In the daily KPI loop where temperature arrays are already collected, add a `degreesDay` output field. `cropBaseTemperature` must come from the `Crop` entity linked to `CropProduction`.

---

### TODO 4.2 — Complete CropET calculation

**File**: `src/app/features/services/calculations/kpi-orchestrator.service.ts` ~line 667

**C# formula**:
```
containerDensity  = 1 / (betweenContainerDist × betweenRowDist)
containerMediumVol = containerVolume × containerDensity
CropET = irrigationVolume − drainVolume − (containerMediumVol × ΔVolumetricWC% / 100)
```
`ΔVolumetricWC` = soil moisture at end of day − soil moisture at start of day.

**How to proceed**: The irrigation and drain volumes are already summed in the KPI loop. Add soil moisture readings at day-start and day-end (already filtered by sensor type in the service). Compute the delta and apply the formula. The `CropET` field already exists on the output object — just populate it.

---

## Phase 5 — Pressure-Based Event Detection (Medium Priority)

---

### TODO 5.1 — Implement minimum-pressure irrigation detection

**File**: `src/app/features/services/irrigation-calculations.service.ts`

**C# method**: `GetCropProductionIrrigationEventsByMinPressure` (IrrigationEventProcess.cs line 211)

**Logic**:
- Pump ON: pressure reading ≥ `IrrigationPressureThreshold`
- Pump OFF: pressure reading drops ≤ `IrrigationPressureThreshold`
- Tracks `initialPressure` and `maxPressure` per event

**How to proceed**: Add a second method `getIrrigationEventsByMinPressure(readings, threshold)` alongside the existing delta-based method. Use the result when the delta method returns zero events (fallback strategy).

---

### TODO 5.2 — Record initial and maximum pressure per event

**File**: `src/app/features/services/irrigation-calculations.service.ts`

**Problem**: C# stores `initialPressure` (reading at pump-on moment) and `maxPressure` (peak during event). Angular creates the event object but never populates these.

**How to proceed**: In both pressure detection methods, capture the reading value at the ON transition as `initialPressure`, and track the running max while `isPumpOn = true` to store as `maxPressure` on event close.

---

## Phase 6 — Sensor Data Quality (Medium Priority)

---

### TODO 6.1 — Implement sensor averaging

**File**: `src/app/features/services/irrigation-calculations.service.ts` → `getIrrigationEventsVolumes()`

**Problem**: When multiple sensors of the same type exist (e.g., two flow meters), C# groups them and takes the average. Angular reads each independently, potentially double-counting or using a faulty sensor's value raw.

**How to proceed**: Before processing a window of readings, group them by `sensorId` (or sensor type), average the values within each timestamp bucket, then proceed with the averaged series. A simple `groupBy + average` utility suffices.

---

### TODO 6.2 — Add configurable time-window delays for soil moisture & EC

**File**: `src/app/features/services/irrigation-calculations.service.ts`

**C# settings used**:
- `MaxVolumetricWaterContentLastReadingDelayMinutes` — how far back before irrigation start to look for a pre-irrigation moisture reading
- `MaxElectroConductivityLastReadingDelayMinutes` — same for EC

**How to proceed**: When fetching "pre-irrigation" soil moisture (the reading just before `event.dateTimeStart`), expand the search window backwards by this many minutes instead of requiring an exact match. Load the value from `CalculationSettingsService` (TODO 3.1).

---

## Phase 7 — Electro-Conductivity Integration (Low Priority)

---

### TODO 7.1 — Add EC sensor data collection

**File**: `src/app/features/services/irrigation-calculations.service.ts`

**Problem**: C# stores min EC at irrigation start and max EC at irrigation end per event. Angular has no EC logic.

**How to proceed**:
1. Identify the EC sensor variable ID via `CalculationSettings` (`ElectroCondutivityMeasurementVariableId`).
2. In `getIrrigationEventsVolumes()`, fetch EC readings per event window using the same time delay as soil moisture (TODO 6.2).
3. Store `minEcAtStart` (reading just before event) and `maxEcAtEnd` (reading just after event) on the event entity.

---

## Phase 8 — Drain Metrics (Low Priority)

---

### TODO 8.1 — Implement drain delay and drain length

**File**: `src/app/features/services/irrigation-calculations.service.ts`

**What C# stores**:
- `DrainDelay` — minutes between irrigation start and first drain reading above threshold
- `DrainLength` — minutes the drain flow remained active

**How to proceed**: After detecting drain volume readings in the event window, find the timestamp of the first non-zero drain reading relative to `event.dateTimeStart` → that's the delay. Find the last non-zero drain timestamp → that's the drain length end. Store both as event measurements.

---

## Quick Reference: Files to Touch per Phase

| Phase | Primary Files |
|---|---|
| 1 — Critical fixes | `irrigation-calculations.service.ts`, `irrigation-decision-engine.service.ts` |
| 2 — On-demand volume | `irrigation-decision-engine.service.ts` |
| 3 — Config loading | new `calculation-settings.service.ts`, both services above |
| 4 — KPIs | `kpi-orchestrator.service.ts` |
| 5 — Pressure detection | `irrigation-calculations.service.ts` |
| 6 — Sensor quality | `irrigation-calculations.service.ts` |
| 7 — EC integration | `irrigation-calculations.service.ts` |
| 8 — Drain metrics | `irrigation-calculations.service.ts` |
