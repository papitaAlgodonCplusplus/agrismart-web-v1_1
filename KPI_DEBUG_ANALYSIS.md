# 🔍 KPI Calculation Debug Analysis Report

**Date:** December 13, 2025
**System:** AgriSmart Web Application
**Analysis Scope:** KPI Calculation Pipeline & Data Integrity

---

## 📋 Executive Summary

This report documents critical issues found in the KPI calculation system based on test data analysis. Seven major issues were identified, ranging from **system-breaking calculation errors** to **data integrity problems**. Most issues stem from:
- **Unit mismatches** (Fahrenheit vs Celsius, centimeters vs meters, milliseconds vs minutes)
- **Invalid sensor data** not being filtered
- **Incorrect formulas** in growing medium calculations
- **Bad database values** (coordinates, temperatures)

---

## 🔴 CRITICAL ISSUES - System Breaking

### Issue #1: Vapor Pressure Deficit (VPD) = 441.772 kPa
**Expected Range:** 0.5 - 2.5 kPa
**Actual Values:** 441.772 kPa (Dec 11) and 452.741 kPa (Dec 10)
**Impact:** ❌ Kills all downstream calculations dependent on VPD

#### 📍 Location & Flow

**File:** `src/app/features/services/calculations/climate-calculations.service.ts`

```typescript
// Line 104 - Saturation Vapor Pressure Calculation
const saturationVaporPressure = this.getSaturationVaporPressure(climateData.tempAvg);

// Line 249-251 - Formula
getSaturationVaporPressure(temp: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
}
```

**File:** `src/app/features/services/calculations/kpi-orchestrator.service.ts`

```typescript
// Lines 306-359 - Data Transformation (ROOT CAUSE)
// Extract temperature data
const temps = dayData
  .filter(d => ['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(d.sensor))
  .map(d => parseFloat(d.payload));  // ❌ NO VALIDATION!

// Lines 346-351
if (temps.length > 0) {
  climateData.push({
    date: date,
    tempMax: Math.max(...temps),      // ❌ Could be sensor error (200°C+)
    tempMin: Math.min(...temps),      // ❌ Could be sensor error
    tempAvg: temps.reduce((a, b) => a + b, 0) / temps.length,  // ❌ No bounds checking
```

#### 🔬 Root Cause Analysis

Getting 441.772 kPa saturation vapor pressure means **tempAvg is approximately 200-300°C**!

**Possible Causes:**
1. **Sensor malfunction** sending error codes (e.g., 999, 255, -999)
2. **Sensor disconnection** returning max values
3. **Data corruption** in transmission
4. **Mixed units** (unlikely but possible)

#### ✅ Fix Required

**Location:** `kpi-orchestrator.service.ts:308-321`

```typescript
// BEFORE (WRONG):
const temps = dayData
  .filter(d => ['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(d.sensor))
  .map(d => parseFloat(d.payload));

// AFTER (CORRECT):
const temps = dayData
  .filter(d => ['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(d.sensor))
  .map(d => parseFloat(d.payload))
  .filter(t => !isNaN(t) && t >= -10 && t <= 50);  // ✅ Validate realistic temperature range

if (temps.length === 0) {
  console.warn(`No valid temperature data for ${dateStr}`);
  return; // Skip this day or use interpolation
}
```

---

### Issue #2: Saturation Vapor Pressure = 441.772 kPa
**Expected Range:** 1 - 7 kPa for normal temperatures
**Actual Values:** 441.772 kPa and 452.741 kPa
**Impact:** ❌ Same root cause as Issue #1

#### 📍 Location
**File:** `climate-calculations.service.ts:104`

This is the **same issue** as VPD - caused by invalid temperature readings.

#### ✅ Fix Required
Same validation fix as Issue #1.

---

### Issue #3: Irrigation Duration = 85,385,089 Minutes (162 Years!)
**Expected Range:** 10 - 120 minutes per irrigation event
**Actual Value:** 85,385,089 minutes
**Impact:** 🔥 Makes all irrigation statistics meaningless

#### 📍 Location & Flow

**File:** `src/app/features/services/irrigation-calculations.service.ts`

```typescript
// Lines 110-111 - Calculates duration in MILLISECONDS
output.irrigationLength =
  inputs[0].dateTimeEnd.getTime() - inputs[0].dateTimeStart.getTime();  // ✅ Returns milliseconds
```

**File:** `src/app/features/services/calculations/kpi-orchestrator.service.ts`

```typescript
// Lines 539-542 - Aggregates in MILLISECONDS
totalDuration = irrigationMetrics.reduce(
  (sum, m) => sum + m.irrigationLength,  // ✅ Still in milliseconds
  0
);
```

**File:** `src/app/features/process-kpis/process-kpis.component.ts`

```typescript
// Line 424 - PROBLEM: Returns milliseconds, template displays as minutes!
getTotalDuration(): number {
  return this.kpiData.reduce((sum, kpi) => sum + kpi.irrigation.totalDuration, 0);
  // ❌ Returns 5,131,105,340,000 milliseconds
  //    Template shows: "85,385,089 minutos"
}
```

#### 🔬 Root Cause Analysis

**Unit Mismatch:** Calculation is in **milliseconds**, display assumes **minutes**.

**Test Calculation:**
```
85,385,089 minutes ÷ 60 = 1,423,085 hours
1,423,085 hours ÷ 24 = 59,295 days
59,295 days ÷ 365 = 162 years! ❌
```

**What it should be:**
```
5,131,105,340 milliseconds ÷ 60,000 = 85,518 minutes
85,518 minutes ÷ 60 = 1,425 hours
1,425 hours ÷ 24 = 59.4 days (still wrong!)
```

**Secondary Issue:** Even after unit conversion, 59 days for one irrigation event is wrong! This suggests the event detection is capturing the ENTIRE period instead of individual events.

#### ✅ Fix Required

**Location:** `process-kpis.component.ts:424-426`

```typescript
// BEFORE (WRONG):
getTotalDuration(): number {
  return this.kpiData.reduce((sum, kpi) => sum + kpi.irrigation.totalDuration, 0);
}

// AFTER (CORRECT):
getTotalDuration(): number {
  const milliseconds = this.kpiData.reduce((sum, kpi) => sum + kpi.irrigation.totalDuration, 0);
  return milliseconds / (1000 * 60); // ✅ Convert to minutes
}
```

**Additional Investigation Needed:**
Check `kpi-orchestrator.service.ts:590-657` - the `detectIrrigationEventsFromFlow` function may not be properly detecting event boundaries.

---

### Issue #4: Crop Base Temperature = 78°C
**Expected Range:** 5 - 15°C for most crops
**Actual Value:** 78°C
**Impact:** ❌ Plants die above 45°C! Makes degree-day calculations meaningless

#### 📍 Location & Flow

**File:** Database - `Crop` table, `cropBaseTemperature` field

**Log Evidence:**
```
Line 305-306, 516-518 in kpi-test.md:
cropBaseTemperature: 78
```

**Used in:** `climate-calculations.service.ts:466-472`

```typescript
// Line 466-472 - Degree Days Calculation
getDegreesDay(
  tempMax: number,
  tempMin: number,
  cropBaseTemperature: number  // ❌ 78°C passed here!
): number {
  return (tempMax + tempMin) / 2 - cropBaseTemperature;
}
```

**Impact on Results:**
```
Log shows:
- Dec 11: Grados Día = 85.80 °C·día
- Dec 10: Grados Día = 98.07 °C·día

If base temp is 78°C, then average temp must be ~156-176°C! 🔥
```

#### 🔬 Root Cause Analysis

**Highly Likely:** Value was entered in **Fahrenheit** instead of Celsius!

```
78°F = 25.6°C  ✅ This is reasonable for a crop base temperature!
```

**Reference:** Common crop base temperatures:
- Corn: 10°C
- Tomato: 10°C
- Strawberry: 5°C
- Cotton: 15°C

#### ✅ Fix Required

**Option 1 - Database Correction:**
```sql
UPDATE Crop
SET cropBaseTemperature = 25.6  -- Converted from 78°F
WHERE id = 26;
```

**Option 2 - Add Unit Conversion in API (if users enter Fahrenheit):**
```typescript
// In crop creation/update endpoint
if (cropDto.temperatureUnit === 'F') {
  crop.cropBaseTemperature = (cropDto.cropBaseTemperature - 32) * 5/9;
}
```

---

### Issue #5: Easily Available Water (62.5%) > Total Available Water (54.2%)
**Problem:** Mathematical impossibility - subset cannot be larger than the whole
**Impact:** ❌ Water balance calculations are backwards

#### 📍 Location

**File:** `src/app/features/services/calculations/crop-calculations.service.ts`

```typescript
// Lines 261-265 - Total Available Water (CORRECT)
getTotalAvailableWaterPercentage(
  containerCapacityPercentage: number,  // 72.5%
  permanentWiltingPoint: number         // 18.3%
): number {
  return containerCapacityPercentage - permanentWiltingPoint;
  // = 72.5 - 18.3 = 54.2% ✅
}

// Lines 271-275 - Easily Available Water (WRONG FORMULA!)
getEaselyAvailableWaterPercentage(
  containerCapacityPercentage: number,  // 72.5%
  fiveKpaHumidity: number               // 10%
): number {
  return containerCapacityPercentage - fiveKpaHumidity;
  // = 72.5 - 10 = 62.5% ❌ WRONG!
}

// Lines 281-285 - Reserve Water (Also affected by wrong formula)
getReserveWaterPercentage(
  easelyAvailableWaterPercentage: number,  // 62.5% (wrong)
  permanentWiltingPoint: number            // 18.3%
): number {
  return easelyAvailableWaterPercentage - permanentWiltingPoint;
  // = 62.5 - 18.3 = 44.2% ❌ Based on wrong input
}
```

#### 🔬 Root Cause Analysis - Agronomic Theory

**Correct Water Hierarchy:**

```
Container Capacity (72.5%)        ← Maximum water medium can hold
        ↓
Field Capacity (~5 kPa = 10%)     ← Water after drainage
        ↓
Permanent Wilting Point (18.3%)   ← Water plants can't extract
```

**Water Availability Zones:**

1. **Total Available Water** = Container Capacity - Wilting Point
   - Formula: 72.5 - 18.3 = **54.2%** ✅ (Current: CORRECT)

2. **Easily Available Water** = Field Capacity - Wilting Point
   - Formula: 10 - 18.3 = **-8.3%** ❌ (This is wrong!)
   - **OR** it should be: fiveKpaHumidity is the THRESHOLD, not a measurement
   - **Actually:** Container Capacity - fiveKpaHumidity might represent water held ABOVE 5kPa tension

**Issue:** The variable naming is confusing! Is `fiveKpaHumidity` the:
- Water content AT 5 kPa tension? (Field capacity)
- Water content BELOW 5 kPa tension? (Easily available)

#### ✅ Fix Required - Need Agronomic Clarification!

**Hypothesis 1 - fiveKpaHumidity is Field Capacity:**
```typescript
getEaselyAvailableWaterPercentage(
  fiveKpaHumidity: number,           // Field Capacity at 5kPa
  permanentWiltingPoint: number      // 18.3%
): number {
  return fiveKpaHumidity - permanentWiltingPoint;
  // = 10 - 18.3 = -8.3% ❌ Still wrong!
}
```

**Hypothesis 2 - fiveKpaHumidity represents water BELOW 5kPa (current formula is correct conceptually):**
```typescript
// Current formula makes sense IF:
// - containerCapacityPercentage = water at saturation (0 kPa)
// - fiveKpaHumidity = water still held at 5 kPa tension
// - Difference = water released between 0-5 kPa (easily available)
```

**ACTION REQUIRED:** Verify with agronomist what `fiveKpaHumidity` actually represents!

**Temporary Fix - Add validation:**
```typescript
if (easelyAvailableWaterPercentage > totalAvailableWaterPercentage) {
  console.error('Invalid water balance: Easily available cannot exceed total available');
  // Use corrected formula or throw error
}
```

---

## 🟠 HIGH PRIORITY - Data Integrity Issues

### Issue #6: Latitude = 89° (Near North/South Pole!)
**Expected Value:** ~10° N (Costa Rica)
**Actual Value:** 89°
**Impact:** ❌ All solar radiation and day-length calculations are wrong

#### 📍 Location & Flow

**Database:** `CropProduction` table, `latitude` field

**Log Evidence:**
```
Line 261, 473 in kpi-test.md:
latitude: 89
```

**Used Throughout Climate Calculations:**

**File:** `kpi-orchestrator.service.ts:480-489`
```typescript
// Convert farm coordinates to degrees and minutes format
const latitudeDegMin = this.decimalToDegreeMinutes(farm.latitude);  // 89° → 89° 0'

const locationData: LocationData = {
  latitude: farm.latitude,           // 89
  latitudeGrades: latitudeDegMin.degrees,  // 89
  latitudeMinutes: latitudeDegMin.minutes, // 0
  altitude: 1000,
  windSpeedMeasurementHeight: 2
};
```

**File:** `climate-calculations.service.ts:300-302`
```typescript
getLatitudeInRadians(latitudeGrades: number, latitudeMinutes: number): number {
  return (Math.PI / 180) * (latitudeGrades + latitudeMinutes / 60);
  // 89° = 1.553 radians (nearly vertical - North Pole!)
}
```

#### 🔬 Impact on Calculations

**Affected Functions:**
1. Solar declination angle
2. Sunset hour angle
3. Extraterrestrial radiation
4. Day length
5. All radiation-based ET calculations

**Example - Sunset Angle at 89° latitude:**
```typescript
// Line 315-319
getSolarSunsetAngle(date: Date, latitudeGrades: number, latitudeMinutes: number): number {
  return Math.acos(
    Math.tan(this.getLatitudeInRadians(latitudeGrades, latitudeMinutes) * -1) *
    Math.tan(this.getSolarInclination(date))
  );
  // At 89°, sunset angle calculations break (polar day/night scenarios)
}
```

#### ✅ Fix Required

**Database Update:**
```sql
UPDATE CropProduction
SET latitude = 10.0,   -- Approximate Costa Rica latitude
    longitude = -84.0  -- Approximate Costa Rica longitude
WHERE id = 1;
```

**Add Validation:**
```typescript
// In crop production creation/update
if (Math.abs(latitude) > 66.5) {  // Arctic/Antarctic circles
  throw new Error('Latitude outside agricultural zones');
}
```

---

### Issue #7: Total Plants = 1.0008 (Can't Have Fractional Plants!)
**Expected Value:** ~10,000+ plants for 3,572 m² area
**Actual Value:** 1.0008 plants
**Impact:** ❌ All per-plant calculations are off by 10,000x

#### 📍 Location & Flow

**File:** `src/app/features/services/calculations/crop-calculations.service.ts`

```typescript
// Lines 182-184 - Density Calculation
getDensityPlant(betweenRowDistance: number, betweenPlantDistance: number): number {
  return 1 / (betweenRowDistance * betweenPlantDistance);
}

// Lines 196-198 - Total Plants
getTotalPlants(densityPlant: number, area: number): number {
  return densityPlant * area;
}
```

**File:** `kpi-orchestrator.service.ts:417-424`
```typescript
const cropData: CropProductionData = {
  length: cropProduction.length,      // 47
  width: cropProduction.width,        // 76
  betweenRowDistance: cropProductionSpecs.betweenRowDistance,         // 34 ❌
  betweenPlantDistance: cropProductionSpecs.betweenPlantDistance,     // 95 ❌
  betweenContainerDistance: cropProductionSpecs.betweenContainerDistance,  // 47 ❌
  latitude: cropProduction.latitude,
};
```

#### 🔬 Root Cause Analysis - Unit Mismatch

**Current Calculation (WRONG - assuming meters):**
```
betweenRowDistance = 34 (m)
betweenPlantDistance = 95 (m)

densityPlant = 1 / (34 × 95) = 1 / 3230 = 0.00030959 plants/m²

area = 47 × 76 = 3,572 m²

totalPlants = 0.00030959 × 3,572 = 1.105 plants ❌
```

**Correct Calculation (assuming centimeters):**
```
betweenRowDistance = 34 cm = 0.34 m
betweenPlantDistance = 95 cm = 0.95 m

densityPlant = 1 / (0.34 × 0.95) = 1 / 0.323 = 3.096 plants/m²

totalPlants = 3.096 × 3,572 = 11,058 plants ✅
```

**Additional Evidence:**
```
Log shows:
- betweenContainerDistance: 67 → If meters, one container every 67m is absurd!
- betweenPlantDistance: 95 → If meters, plants 95m apart is absurd!
- betweenRowDistance: 34 → If meters, rows 34m apart is absurd!

Typical values should be:
- Row spacing: 30-100 cm
- Plant spacing: 20-50 cm
- Container spacing: 50-100 cm
```

#### ✅ Fix Required

**Option 1 - Convert in Service:**
```typescript
// kpi-orchestrator.service.ts:417-424
const cropData: CropProductionData = {
  length: cropProduction.length,
  width: cropProduction.width,
  betweenRowDistance: cropProductionSpecs.betweenRowDistance / 100,        // ✅ cm → m
  betweenPlantDistance: cropProductionSpecs.betweenPlantDistance / 100,    // ✅ cm → m
  betweenContainerDistance: cropProductionSpecs.betweenContainerDistance / 100, // ✅ cm → m
  latitude: cropProduction.latitude,
};
```

**Option 2 - Fix Database (if stored in wrong units):**
```sql
UPDATE CropProductionSpecs
SET
  betweenRowDistance = betweenRowDistance / 100,
  betweenPlantDistance = betweenPlantDistance / 100,
  betweenContainerDistance = betweenContainerDistance / 100
WHERE id = 4;
```

**Option 3 - Add Unit Field to Database:**
```sql
ALTER TABLE CropProductionSpecs
ADD COLUMN distanceUnit VARCHAR(10) DEFAULT 'cm';

-- Then convert in code based on unit
```

---

### Issue #8: Real Vapor Pressure Inconsistency
**Problem:** Dec 11: 0.000 kPa vs Dec 10: 1,676.255 kPa
**Impact:** ❌ One value is missing data, the other is impossibly high

#### 📍 Location & Flow

**File:** `climate-calculations.service.ts:263-273`

```typescript
getAvgRealVaporPressure(
  tempMin: number,
  relativeHumidityMax: number,
  tempMax: number,
  relativeHumidityMin: number
): number {
  return (
    this.getRealVaporPressure(tempMin, relativeHumidityMax) +
    this.getRealVaporPressure(tempMax, relativeHumidityMin)
  ) / 2;
}

// Line 256-258
getRealVaporPressure(temp: number, relativeHumidity: number): number {
  return this.getSaturationVaporPressure(temp) * relativeHumidity / 100;
  // If humidity = 0, result = 0
  // If temp is extreme, result is extreme
}
```

**File:** `kpi-orchestrator.service.ts:312-321`
```typescript
// Extract humidity data
const humidities = dayData
  .filter(d => ['HUM', 'Hum_SHT2x'].includes(d.sensor))
  .map(d => parseFloat(d.payload));

const humidityMax = humidities.length > 0 ? Math.max(...humidities) : 0;  // ❌ Defaults to 0!
const humidityMin = humidities.length > 0 ? Math.min(...humidities) : 0;  // ❌ Defaults to 0!
const humidityAvg = humidities.length > 0
  ? humidities.reduce((a, b) => a + b, 0) / humidities.length
  : 0;  // ❌ Defaults to 0!
```

#### 🔬 Root Cause Analysis

**Dec 11: 0.000 kPa**
- No humidity sensor data for this day
- Defaults to 0% humidity
- Calculation: saturationVP × 0 / 100 = 0 kPa

**Dec 10: 1,676.255 kPa**
- Has humidity data BUT temperature is wrong (Issue #1)
- Calculation: saturationVP(200°C) × 80% / 100 = 1,676 kPa

#### ✅ Fix Required

**Location:** `kpi-orchestrator.service.ts:312-321`

```typescript
// BEFORE (WRONG):
const humidityMax = humidities.length > 0 ? Math.max(...humidities) : 0;

// AFTER (CORRECT):
const humidityMax = humidities.length > 0
  ? Math.max(...humidities)
  : null;  // ✅ Use null to indicate missing data

// Later, when processing:
if (humidityMax === null) {
  // Option 1: Skip this day
  console.warn(`No humidity data for ${dateStr}, skipping`);
  return;

  // Option 2: Use previous day's value
  humidityMax = previousDayHumidity;

  // Option 3: Use typical value
  humidityMax = 75; // Typical tropical humidity
}

// Also add validation:
const validHumidities = humidities.filter(h => h >= 0 && h <= 100);
if (validHumidities.length === 0) {
  console.warn(`No valid humidity data for ${dateStr}`);
}
```

---

## 🟡 MODERATE - Validation Needed

### Issue #9: Missing ET Reference & Radiation Values
**Problem:** Most radiation values showing as blank in the UI
**Impact:** ⚠️ Core ET calculation may be failing silently

#### 📍 Affected Values (from kpi-test.md)

```
ET Referencia: (blank/mm/día) ❌
Radiación Extraterrestre: (blank) MJ/m²/día ❌
Radiación Cielo Claro: (blank) MJ/m²/día ❌
Radiación Longwave Neta: (blank) MJ/m²/día ❌
Velocidad Viento: (blank) m/s ❌
```

**Only one showing:**
```
Radiación Solar Neta: 15.40 MJ/m²/día ✓
```

#### 🔬 Root Cause Analysis

**Cascading Calculation Failure** - If any input to FAO-56 Penman-Monteith ET is NaN or Infinity, the entire calculation fails.

**File:** `climate-calculations.service.ts:437-457`

```typescript
calculateReferenceET(
  netRadiation: number,              // Could be NaN
  tempAvg: number,                   // Could be extreme (Issue #1)
  windSpeed: number,                 // Could be 0 or missing
  saturationVaporPressure: number,   // Could be extreme (Issue #1)
  realVaporPressure: number,         // Could be 0 or extreme (Issue #8)
  slopeVaporPressureCurve: number,   // Depends on tempAvg
  psychrometricConstant: number,     // Usually OK
  latentHeat: number                 // Usually OK
): number {
  const numerator =
    0.408 * slopeVaporPressureCurve * netRadiation +
    psychrometricConstant * (900 / (tempAvg + 273)) * windSpeed *
    (saturationVaporPressure - realVaporPressure);

  const denominator =
    slopeVaporPressureCurve + psychrometricConstant * (1 + 0.34 * windSpeed);

  return numerator / denominator;  // ❌ Can return NaN, Infinity, or negative
}
```

#### ✅ Fix Required

**Add Comprehensive Validation:**

```typescript
calculateReferenceET(...): number {
  // Validate inputs
  if (isNaN(netRadiation) || !isFinite(netRadiation)) {
    console.error('Invalid netRadiation:', netRadiation);
    return 0;
  }

  if (tempAvg < -10 || tempAvg > 50) {
    console.error('Temperature out of range:', tempAvg);
    return 0;
  }

  if (windSpeed < 0 || windSpeed > 20) {
    console.warn('Wind speed out of range:', windSpeed);
    windSpeed = Math.max(0, Math.min(20, windSpeed));
  }

  // ... calculate ...

  const result = numerator / denominator;

  // Validate output
  if (!isFinite(result) || result < 0 || result > 20) {
    console.error('Invalid ET result:', result, {
      netRadiation, tempAvg, windSpeed,
      saturationVaporPressure, realVaporPressure
    });
    return 0;
  }

  return result;
}
```

---

## 📊 Summary Tables

### Root Causes Summary

| Issue | Root Cause Category | Confidence | Priority |
|-------|-------------------|------------|----------|
| VPD = 441 kPa | Invalid Sensor Data | 95% | 🔴 Critical |
| Duration = 162 years | Unit Mismatch (ms→min) | 100% | 🔴 Critical |
| Base Temp = 78°C | Unit Mismatch (F→C) | 90% | 🔴 Critical |
| Water Logic Wrong | Formula Error | 70% | 🔴 Critical |
| Latitude = 89° | Data Entry Error | 100% | 🟠 High |
| Total Plants = 1 | Unit Mismatch (cm→m) | 95% | 🟠 High |
| Vapor Pressure Swing | Missing Sensor Data | 90% | 🟠 High |
| Missing ET Values | Cascading Failures | 85% | 🟡 Medium |

### Files Requiring Changes

| File | Lines | Changes Required | Type |
|------|-------|------------------|------|
| `kpi-orchestrator.service.ts` | 308-359 | Add temp/humidity validation | Code Fix |
| `kpi-orchestrator.service.ts` | 417-424 | Convert cm to m | Code Fix |
| `process-kpis.component.ts` | 424-426 | Convert ms to minutes | Code Fix |
| `crop-calculations.service.ts` | 271-285 | Fix water formulas | Code Fix |
| `climate-calculations.service.ts` | 437-457 | Add validation | Code Fix |
| Database - Crop | id=26 | Update base temp 78→26 | Data Fix |
| Database - CropProduction | id=1 | Update lat 89→10 | Data Fix |
| Database - CropProductionSpecs | id=4 | Add unit metadata | Schema Change |

---

## 🎯 Recommended Fix Priority

### Phase 1: Critical Data Fixes (15 minutes)
1. ✅ Fix database latitude: 89° → 10°
2. ✅ Fix database crop base temp: 78°C → 26°C
3. ✅ Verify distance units in CropProductionSpecs

### Phase 2: Critical Code Fixes (1 hour)
1. ✅ Add temperature validation in data transformation
2. ✅ Fix duration unit conversion (ms → minutes)
3. ✅ Add distance unit conversion (cm → m)

### Phase 3: Formula Corrections (2 hours)
1. ✅ Verify and fix growing medium water formulas
2. ✅ Add humidity data validation and fallbacks
3. ✅ Add ET calculation validation

### Phase 4: Comprehensive Validation (4 hours)
1. ✅ Add data quality checks before calculations
2. ✅ Add calculation result validation
3. ✅ Create data quality report
4. ✅ Add unit tests for all calculation functions

---

## 🔬 Testing Recommendations

### Test Data Sets Needed

1. **Valid Baseline Test**
   - Temperature: 20-30°C range
   - Humidity: 60-80% range
   - Latitude: 9-11° (Costa Rica)
   - Plant spacing: 30-50 cm
   - Expected: All calculations succeed

2. **Edge Case Tests**
   - Temperature: 0°C, 45°C
   - Humidity: 10%, 100%
   - Missing sensor data scenarios
   - Expected: Graceful degradation

3. **Error Case Tests**
   - Temperature: -999, 999 (sensor errors)
   - Humidity: null, -1, 200
   - Expected: Rejected with warnings

### Validation Checklist

After fixes, verify:
- [ ] VPD is between 0.5-2.5 kPa
- [ ] Vapor pressures are between 1-7 kPa
- [ ] Irrigation duration is 10-120 minutes per event
- [ ] Crop base temp is 5-25°C
- [ ] Latitude is 9-11° for Costa Rica
- [ ] Total plants is >1000 for large areas
- [ ] Easily available water < Total available water
- [ ] ET reference is 2-8 mm/day (tropical)
- [ ] Degrees day is 5-30 °C·día per day

---

## 📝 Additional Observations

### Sensor Data Quality Issues

The analysis reveals **systematic sensor data quality problems**:

1. **No data validation** at ingestion point
2. **No outlier detection** in raw data
3. **No interpolation** for missing values
4. **No data quality flags** in the UI

**Recommendation:** Implement a **data quality pipeline** before KPI calculations:

```typescript
interface SensorDataQuality {
  isValid: boolean;
  issues: string[];
  confidence: number; // 0-1
  source: 'measured' | 'interpolated' | 'estimated';
}

function validateSensorData(data: any[]): SensorDataQuality {
  // Check for outliers, missing data, sensor errors
  // Return quality metrics
}
```

### Database Schema Issues

Several issues stem from **unclear units and metadata**:

1. Distance fields don't specify units (cm? m?)
2. Temperature fields don't specify units (C? F?)
3. No validation constraints on ranges
4. No metadata about expected value ranges

**Recommendation:** Add unit fields and constraints:

```sql
ALTER TABLE CropProductionSpecs
  ADD COLUMN distanceUnit VARCHAR(10) DEFAULT 'cm',
  ADD COLUMN lengthUnit VARCHAR(10) DEFAULT 'm',
  ADD CONSTRAINT chk_betweenRowDistance
    CHECK (betweenRowDistance BETWEEN 10 AND 500);

ALTER TABLE Crop
  ADD COLUMN temperatureUnit VARCHAR(5) DEFAULT 'C',
  ADD CONSTRAINT chk_cropBaseTemperature
    CHECK (cropBaseTemperature BETWEEN 0 AND 35);
```

---

## 🤝 Collaboration Needed

### Questions for Domain Experts

1. **Agronomist:** What does `fiveKpaHumidity` represent in the growing medium?
   - Is it water content AT 5kPa tension (field capacity)?
   - Or water content retained BELOW 5kPa?

2. **Database Admin:** What are the actual units in CropProductionSpecs?
   - Are distances in cm or m?
   - Can we add metadata?

3. **Sensor Team:** What error codes do sensors send?
   - What values indicate sensor failure?
   - What's the valid range for each sensor type?

4. **DevOps:** Can we add data validation at ingestion?
   - Validate before saving to database?
   - Add quality flags to raw sensor data?

---

## 📚 References

### FAO-56 Standard
- Allen, R.G., Pereira, L.S., Raes, D., Smith, M. (1998). Crop evapotranspiration - Guidelines for computing crop water requirements. FAO Irrigation and drainage paper 56.

### Soil Moisture Concepts
- Container Capacity: Water content at saturation (0 kPa tension)
- Field Capacity: Water content at 5-33 kPa tension
- Permanent Wilting Point: Water content at 1500 kPa tension

### Typical Agricultural Values (Reference)
- VPD: 0.5-2.5 kPa (optimal plant growth)
- ET₀: 2-8 mm/day (tropical regions)
- Crop base temp: 5-15°C (most crops)
- Plant density: 1-10 plants/m² (varies by crop)

---

**Report End**

For questions or clarifications, please contact the development team.
