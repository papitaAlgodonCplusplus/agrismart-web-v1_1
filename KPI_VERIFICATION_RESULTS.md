# KPI Calculation Issues - Verification Results

**Date:** December 14, 2025
**Test Parameters:**
- Production: Genérica frutos
- Date Range: 12/07/2025 - 12/14/2025
- Application: http://localhost:4200/process-kpis

---

## Code-Level Verification Summary

### ✅ FIXES ALREADY APPLIED (Code Review Confirmed)

#### Issue #3: Irrigation Duration Unit Conversion ✅ FIXED
**File:** `src/app/features/process-kpis/process-kpis.component.ts:459-462`

**Status:** ✅ **FIXED**

**Evidence:**
```typescript
getTotalDuration(): number {
  const milliseconds = this.kpiData.reduce((sum, kpi) => sum + kpi.irrigation.totalDuration, 0);
  return milliseconds / (1000 * 60); // Convert milliseconds to minutes
}
```

**Verification:** The milliseconds to minutes conversion is correctly implemented.

---

#### Issue #7: Plant Density Unit Conversion (cm → m) ✅ FIXED
**File:** `src/app/features/services/calculations/kpi-orchestrator.service.ts:511`

**Status:** ✅ **FIXED**

**Evidence:**
```typescript
betweenRowDistance: cropProductionSpecs.betweenRowDistance / 100, // Convert cm to m
betweenPlantDistance: cropProductionSpecs.betweenPlantDistance / 100, // Convert cm to m
betweenContainerDistance: cropProductionSpecs.betweenContainerDistance / 100, // Convert cm to m
```

**Verification:** All distance values are now converted from centimeters to meters before calculations.

**Expected Impact:**
- Previous: `totalPlants = 1.0008` (absurdly low)
- After fix: `totalPlants ≈ 11,058` plants (realistic for 3,572 m²)

---

#### Issue #1 & #2: Temperature Validation & Capping ✅ PARTIALLY FIXED
**File:** `src/app/features/services/calculations/kpi-orchestrator.service.ts:315-433`

**Status:** ✅ **PARTIALLY FIXED** (Temperature capping implemented, but needs validation)

**Evidence:**
```typescript
// Lines 315-331: Pre-calculate capping values from ALL raw temperature data
const allRawTemps: number[] = [];
rawData.forEach(item => {
  if (['TEMP_SOIL', 'TempC_DS18B20', 'temp_SOIL'].includes(item.sensor)) {
    const temp = parseFloat(item.payload);
    if (!isNaN(temp)) {
      allRawTemps.push(temp);
    }
  }
});

const validMaxTemps = allRawTemps.filter(t => t <= 43);
const capMaxValue = validMaxTemps.length > 0 ? Math.max(...validMaxTemps) : null;

const validMinTemps = allRawTemps.filter(t => t > 0);
const capMinValue = validMinTemps.length > 0 ? Math.min(...validMinTemps) : null;

// Lines 407-420: Apply capping to individual temperature readings
const cappedTemps = temps.map(t => {
  let cappedTemp = t;
  // Cap max temperature
  if (t > 43 && capMaxValue !== null) {
    cappedTemp = capMaxValue;
  }
  // Cap min temperature (only if original temp was 0)
  if (t === 0 && capMinValue !== null) {
    cappedTemp = capMinValue;
  }
  return cappedTemp;
});
```

**What This Does:**
1. Collects all raw temperature readings across all days
2. Finds the maximum valid temperature (≤ 43°C)
3. Finds the minimum valid temperature (> 0°C)
4. Caps outliers (>43°C or 0°C) to these valid values
5. Prevents extreme temperatures from breaking VPD/vapor pressure calculations

**Concerns:**
- ⚠️ This caps to the highest valid reading, but doesn't reject sensor errors completely
- ⚠️ If a sensor sends 200°C and the next highest is 42°C, it will use 42°C
- ⚠️ Better approach: reject outliers beyond realistic range (-10°C to 50°C)

**Recommendation:** Needs runtime testing to verify VPD values are now in range (0.5-2.5 kPa)

---

#### Issue #8: Humidity Validation ✅ FIXED
**File:** `src/app/features/services/calculations/kpi-orchestrator.service.ts:358-372`

**Status:** ✅ **FIXED**

**Evidence:**
```typescript
// Extract humidity data with validation
const humidities = dayData
  .filter(d => ['HUM', 'Hum_SHT2x'].includes(d.sensor))
  .map(d => parseFloat(d.payload))
  .filter(h => !isNaN(h) && h >= 0 && h <= 100); // Validate humidity range

const humidityMax = humidities.length > 0 ? Math.max(...humidities) : 0;
const humidityMin = humidities.length > 0 ? Math.min(...humidities) : 0;
const humidityAvg = humidities.length > 0
  ? humidities.reduce((a, b) => a + b, 0) / humidities.length
  : 0;

if (humidities.length === 0) {
  console.warn(`No valid humidity data for ${dateStr}, setting to 0`);
}
```

**Verification:** Humidity values are now validated to be between 0-100%.

---

#### Wind Speed & Radiation Validation ✅ FIXED
**File:** `src/app/features/services/calculations/kpi-orchestrator.service.ts:374-399`

**Status:** ✅ **FIXED**

**Evidence:**
```typescript
// Extract wind speed data with validation
const windSpeeds = dayData
  .filter(d => ['wind_speed', 'wind_speed_level'].includes(d.sensor))
  .map(d => parseFloat(d.payload))
  .filter(w => !isNaN(w) && w >= 0 && w <= 20); // Validate wind speed range

// Extract solar radiation data with validation
const radiationReadings = dayData
  .filter(d => ['illumination', 'PAR', 'TSR'].includes(d.sensor))
  .map(d => parseFloat(d.payload))
  .filter(r => !isNaN(r) && r >= 0 && r <= 40); // Validate radiation range
```

**Verification:** Wind and radiation values are now validated to realistic ranges.

---

### ❓ FIXES REQUIRE DATABASE CHANGES (Cannot Verify via Code)

#### Issue #4: Crop Base Temperature = 78°C ❓ DATABASE ISSUE
**File:** Database - `Crop` table, field `cropBaseTemperature`

**Status:** ❓ **REQUIRES DATABASE UPDATE**

**Problem:** Value stored as 78°C (likely entered as Fahrenheit)
**Expected:** 25.6°C (converted from 78°F)

**SQL Fix Required:**
```sql
UPDATE Crop
SET cropBaseTemperature = 25.6  -- Converted from 78°F to Celsius
WHERE id = 26;
```

**Cannot verify via code** - requires database query or runtime testing.

---

#### Issue #6: Latitude = 89° (Near North Pole!) ❓ DATABASE ISSUE
**File:** Database - `CropProduction` table, field `latitude`

**Status:** ❓ **REQUIRES DATABASE UPDATE**

**Problem:** Value stored as 89° (near North Pole)
**Expected:** ~10° (Costa Rica latitude)

**SQL Fix Required:**
```sql
UPDATE CropProduction
SET latitude = 10.0,   -- Approximate Costa Rica latitude
    longitude = -84.0  -- Approximate Costa Rica longitude
WHERE id = 1;
```

**Cannot verify via code** - requires database query or runtime testing.

---

### ❌ FIXES NOT YET APPLIED (Need Code Changes)

#### Issue #5: Water Percentage Logic ❌ NOT FIXED (Pending Agronomic Review)
**File:** `src/app/features/services/calculations/crop-calculations.service.ts:280-289`

**Status:** ❌ **NOT FIXED** - Awaiting agronomic clarification

**Current Code:**
```typescript
/**
 * Calculate easily available water percentage
 *
 * NOTE: This formula needs agronomic review. The parameter 'fiveKpaHumidity'
 * interpretation affects the calculation:
 * - If it's water content AT 5kPa (field capacity), formula should be different
 * - If it's water held BELOW 5kPa tension, current formula might be correct
 *
 * Validation added to prevent EAW > TAW (mathematically impossible)
 */
getEaselyAvailableWaterPercentage(
  containerCapacityPercentage: number,  // 72.5%
  fiveKpaHumidity: number               // 10%
): number {
  return containerCapacityPercentage - fiveKpaHumidity;
  // = 72.5 - 10 = 62.5%
}
```

**Problem:**
- Easily Available Water (62.5%) > Total Available Water (54.2%)
- This is mathematically impossible (subset cannot be larger than whole)

**Blocker:** Need agronomic expert to clarify what `fiveKpaHumidity` represents:
1. Water content **AT** 5kPa tension (field capacity)?
2. Water content **BELOW** 5kPa tension?

**Cannot fix without expert input.**

---

## 📊 Verification Status Summary

| Issue # | Description | Status | Verification Method |
|---------|-------------|--------|---------------------|
| 1 | VPD = 441 kPa | ✅ Capping Applied | ❓ Needs Runtime Test |
| 2 | Saturation VP = 441 kPa | ✅ Capping Applied | ❓ Needs Runtime Test |
| 3 | Duration = 85M min | ✅ Fixed | ✅ Code Verified |
| 4 | Base Temp = 78°C | ❓ Database | ❓ Needs SQL/Runtime |
| 5 | Water Logic Wrong | ❌ Not Fixed | ⚠️ Blocked - Needs Expert |
| 6 | Latitude = 89° | ❓ Database | ❓ Needs SQL/Runtime |
| 7 | Total Plants = 1 | ✅ Fixed | ✅ Code Verified |
| 8 | Humidity Validation | ✅ Fixed | ✅ Code Verified |

---

## 🔍 Next Steps for Complete Verification

### Step 1: Database Verification
Run these queries to check database values:

```sql
-- Check crop base temperature
SELECT id, cropName, cropBaseTemperature
FROM Crop
WHERE id = 26;

-- Check latitude/longitude
SELECT id, latitude, longitude
FROM CropProduction
WHERE id = 1;

-- Check distance units
SELECT id, betweenRowDistance, betweenPlantDistance, betweenContainerDistance
FROM CropProductionSpecs
WHERE id = 4;
```

### Step 2: Runtime Testing
1. Navigate to http://localhost:4200/process-kpis
2. Select "Genérica frutos" production
3. Set date range: 12/07/2025 - 12/14/2025
4. Click "Calcular KPIs"
5. Open browser DevTools Console (F12)
6. Check console logs for:
   - Temperature warnings (should see capping messages if outliers exist)
   - VPD values (should be 0.5-2.5 kPa)
   - Total plants (should be >1000)
7. Inspect displayed values:
   - Irrigation Duration (should be reasonable, e.g., 30-120 minutes)
   - Degrees Day (should be 5-30 °C·día per day)
   - Total Plants (should be >1000)

### Step 3: Console Log Analysis
Key console messages to watch for:
- `Warning: Some raw temperature values exceed 43°C - will cap to X°C`
- `No valid humidity data for YYYY-MM-DD, setting to 0`
- `No valid wind speed data for YYYY-MM-DD, setting to 0`

---

## 📝 Recommendations

### High Priority
1. ✅ **Duration fix is complete** - should now display correct minutes
2. ✅ **Plant density fix is complete** - should now show realistic plant counts
3. ❓ **Verify database values** for latitude and crop base temperature
4. ❓ **Runtime test** to confirm VPD values are now in range

### Medium Priority
5. ⚠️ **Consult agronomist** about water percentage formula (Issue #5)
6. 🔍 **Add stricter temperature validation** - reject readings outside -10°C to 50°C range

### Low Priority
7. 📊 Add data quality dashboard to show sensor data quality metrics
8. 📈 Add unit tests for all calculation functions

---

**Report End**

Next action: Manually test the application to verify runtime behavior and console logs.
