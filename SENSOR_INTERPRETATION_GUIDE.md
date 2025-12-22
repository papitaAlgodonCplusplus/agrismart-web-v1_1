# Sensor Data Interpretation Guide

**Based on:** Working Dashboard Component (`dashboard.component.ts:1109-1196`)
**Date:** 2025-12-20

---

## How Dashboard Component Reads Raw Sensor Data

### Data Structure
```typescript
// Raw device data format
interface RawDeviceData {
  id: number;
  recordDate: string;      // ISO timestamp
  clientId: string;
  userId: string;
  deviceId: string;
  sensor: string;          // Sensor type identifier
  payload: string | number; // Raw sensor value
}
```

---

## Sensor Type Mapping & Unit Conversions

### 1. Temperature Sensors

**Sensor Names:**
- `temp` (generic temperature sensor)
- `temp_DS18B20` (Dallas DS18B20 digital temperature sensor)
- `TempC_DS18B20` (alias)
- `temp_SOIL` (soil temperature)
- `TEMP_SOIL` (soil temperature)
- `TEM` (air temperature)

**Raw Payload Interpretation:**
```typescript
// Dashboard extracts temperature like this (line 1117-1118):
const temps = this.extractSensorValues(sensors, 'temp')
  .map(v => v / 10); // ⚠️ CRITICAL: Divide by 10!
```

**Unit Conversion:**
- **Raw payload:** Sensor returns value × 10 (e.g., 235 = 23.5°C)
- **Actual temperature:** `payload / 10` = °C
- **Example:**
  - Raw: 327.6 → **Not divided** → Shows as 327.6°C ❌
  - Correct: 3276 / 10 = 327.6°C (still wrong - likely bad sensor)
  - OR: 235 / 10 = 23.5°C ✅

**Why this matters:**
- Shiny dashboard probably shows RAW value without `/10` conversion
- This explains impossible temperatures like 327.6°C

---

### 2. Humidity Sensors

**Sensor Names:**
- `HUM` (generic humidity sensor)
- `Hum_SHT2x` (Sensirion SHT2x humidity sensor)

**Raw Payload Interpretation:**
```typescript
// Dashboard extracts humidity like this (line 1121-1124):
const humidities = [
  ...this.extractSensorValues(sensors, 'HUM'),
  ...this.extractSensorValues(sensors, 'Hum_SHT2x')
];
// No conversion needed - already in %
```

**Unit:**
- **Raw payload:** Already in % (0-100)
- **No conversion needed**
- **Example:** 75.5 = 75.5% RH ✅

**Critical for VPD:**
```typescript
// VPD calculation (line 1157-1160):
const actualVaporPressure = humidityStats.avg > 0
  ? (humidityStats.avg / 100) * saturationVaporPressure
  : 0;
const vaporPressureDeficit = saturationVaporPressure - actualVaporPressure;
```

**Why VPD = 0.00 in Shiny:**
- If humidity data is missing → `humidityStats.avg = 0`
- If `humidityStats.avg = 0` → `actualVaporPressure = 0`
- But this should still give VPD = saturationVP > 0
- **Issue:** Shiny probably doesn't extract `HUM` or `Hum_SHT2x` sensors at all!

---

### 3. Wind Speed Sensors

**Sensor Names:**
- `wind_speed_level` (preferred - already in m/s)
- `wind_speed` (raw - may need conversion)

**Raw Payload Interpretation:**
```typescript
// Dashboard extracts wind speed like this (line 1127):
const windSpeeds = this.extractSensorValues(sensors, 'wind_speed_level');
// Uses 'wind_speed_LEVEL' not 'wind_speed'!
```

**Unit:**
- **`wind_speed_level`:** Already in m/s ✅
- **`wind_speed`:** May be in different units
- **No conversion needed** for `wind_speed_level`

---

### 4. Solar Radiation (PAR) Sensors

**Sensor Names:**
- `TSR` (Total Solar Radiation)
- `PAR` (Photosynthetically Active Radiation)

**Raw Payload Interpretation:**
```typescript
// Dashboard extracts solar radiation like this (line 1130):
const solarRadiation = this.extractSensorValues(sensors, 'TSR');
// Unit: W/m² (no conversion)
```

**Unit:**
- **Raw payload:** W/m²
- **No conversion needed**
- **Expected range:** 0-1200 W/m²

**Light Integral Calculation:**
```typescript
// Line 1187:
lightIntegral: solarStats.avg * 3.6 // Convert to MJ/m²/day
```

**Why PAR is too high in Shiny:**
- Shiny might be using wrong sensor name (`PAR` instead of `TSR`)
- Or reading cumulative values instead of instantaneous
- Or missing the proper sensor name filter

---

### 5. Soil Conductivity Sensors

**Sensor Names:**
- `conduct_SOIL`
- `EC_SOIL`

**Expected Unit:**
- **Likely:** μS/cm (microsiemens per centimeter)
- **Dashboard assumption:** Check if dashboard uses conductivity (currently not in climate KPI calculation)

**Issue in Shiny:**
- Shows 325.0 mS/cm (millisiemens) ❌
- Should be 325 μS/cm = 0.325 mS/cm ✅
- **Conversion:** Divide by 1000 if treating as μS/cm

---

### 6. pH Sensors

**Sensor Names:**
- `PH_SOIL`
- `PH1_SOIL`
- `ph_SOIL` (alias)

**Unit:**
- **Raw payload:** pH units (0-14)
- **No conversion needed**
- **Expected range:** 4.0-8.5 for agricultural soil

---

## Key Helper Methods from Dashboard

### 1. Extract Sensor Values
```typescript
private extractSensorValues(sensors: any[], sensorName: string): number[] {
  return sensors
    .filter(s => s.sensor.includes(sensorName))  // ⚠️ Uses .includes() not ===
    .map(s => typeof s.payload === 'number' ? s.payload : parseFloat(s.payload))
    .filter(v => !isNaN(v));
}
```

**Important:**
- Uses `.includes(sensorName)` - partial match!
- Handles both string and number payloads
- Filters out NaN values

### 2. Calculate Statistics
```typescript
private calculateStatsValues(values: number[]): { min: number; max: number; avg: number } {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0 };  // ⚠️ Returns 0 if no data
  }

  return {
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((sum, v) => sum + v, 0) / values.length
  };
}
```

**Important:**
- Returns `{0, 0, 0}` if no sensor data found
- This is why VPD can end up 0 if humidity data is missing!

### 3. Group by Hour
```typescript
private groupRawDataByHour(): Map<number, any[]> {
  const grouped = new Map<number, any[]>();

  this.rawData.deviceRawData.forEach((point: any) => {
    const date = new Date(point.recordDate);
    const hourKey = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours()
    ).getTime();

    if (!grouped.has(hourKey)) {
      grouped.set(hourKey, []);
    }
    grouped.get(hourKey)!.push(point);
  });

  return grouped;
}
```

**Important:**
- Groups all sensor readings by hour
- Uses hour timestamp as key
- This is hourly aggregation, not individual readings!

---

## VPD Calculation - Working Example from Dashboard

```typescript
// Line 1156-1160
const saturationVaporPressure = this.getSaturationVaporPressure(tempStats.avg);
const actualVaporPressure = humidityStats.avg > 0
  ? (humidityStats.avg / 100) * saturationVaporPressure
  : 0;
const vaporPressureDeficit = saturationVaporPressure - actualVaporPressure;
```

**Formula breakdown:**
```typescript
// Saturation vapor pressure (kPa)
private getSaturationVaporPressure(temp: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
}

// Example with T = 25°C, RH = 70%:
// es = 0.6108 * exp((17.27 * 25) / (25 + 237.3))
// es = 0.6108 * exp(431.75 / 262.3)
// es = 0.6108 * exp(1.646)
// es = 0.6108 * 5.187
// es = 3.168 kPa

// ea = (70 / 100) * 3.168 = 2.218 kPa
// VPD = 3.168 - 2.218 = 0.950 kPa ✅
```

**Why Shiny shows 0.00:**
- If `humidityStats.avg = 0` (no data):
  - `actualVaporPressure = 0`
  - `VPD = saturationVP - 0 = saturationVP` (should be > 0!)
- **But Shiny shows 0.00, so either:**
  1. `saturationVaporPressure` is also 0 (temp data missing)
  2. VPD is being overwritten somewhere
  3. Different calculation is used

---

## ET Calculation - Working Example from Dashboard

```typescript
// Line 1163-1169
const referenceET = this.calculateReferenceET(
  tempStats.avg,
  windStats.avg,
  solarStats.avg,
  location.latitude,
  location.altitude
);
```

**Full method:**
```typescript
private calculateReferenceET(
  temp: number,
  windSpeed: number,
  solarRadiation: number,
  latitude: number,
  altitude: number
): number {
  // Simplified FAO-56 Penman-Monteith
  const delta = this.getSlopeVaporPressureCurve(temp);
  const gamma = this.getPsychrometricConstant(altitude);
  const Rn = solarRadiation * 0.0864; // Convert W/m² to MJ/m²/day

  const numerator = 0.408 * delta * Rn + gamma * (900 / (temp + 273)) * windSpeed * 0.5;
  const denominator = delta + gamma * (1 + 0.34 * windSpeed);

  return Math.max(0, numerator / denominator);
}
```

**Key points:**
- Uses **900** coefficient = **DAILY** ET formula
- Converts solar radiation: `W/m² * 0.0864 = MJ/m²/day`
- This is for **hourly aggregated data** displayed as daily equivalent
- Result is in **mm/day**

**Dashboard displays:**
```typescript
// Line 1186
cropET: referenceET * 1.1  // Applies crop coefficient
```

---

## Critical Differences: Dashboard vs Shiny

| Aspect | Dashboard | Shiny Dashboard | Impact |
|--------|-----------|-----------------|--------|
| **Temperature conversion** | `v / 10` | Probably missing | Shows 10x too high |
| **Humidity extraction** | `HUM`, `Hum_SHT2x` | Unknown sensors? | VPD = 0.00 |
| **Wind sensor** | `wind_speed_level` | `wind_speed`? | May be wrong units |
| **Solar radiation** | `TSR` | `PAR`? | Different sensor type |
| **Data aggregation** | Hourly groups | Unknown | May affect calculations |
| **ET formula** | Daily (900) | Hourly (37)? | Unit mismatch |
| **Validation** | Returns 0 if no data | No validation? | Displays garbage |

---

## Recommended Fixes for Shiny Dashboard

### 1. Add Temperature Conversion
```typescript
// BEFORE
const temperature = parseFloat(sensor.payload);

// AFTER
const temperature = parseFloat(sensor.payload) / 10;  // ✅ Match dashboard
```

### 2. Use Correct Sensor Names
```typescript
// BEFORE
const humidities = this.extractSensorValues(sensors, 'Humidity');

// AFTER - Match dashboard exactly
const humidities = [
  ...this.extractSensorValues(sensors, 'HUM'),
  ...this.extractSensorValues(sensors, 'Hum_SHT2x')
];
```

### 3. Use Correct Wind Speed Sensor
```typescript
// BEFORE
const windSpeeds = this.extractSensorValues(sensors, 'wind_speed');

// AFTER - Match dashboard exactly
const windSpeeds = this.extractSensorValues(sensors, 'wind_speed_level');
```

### 4. Use Correct Solar Radiation Sensor
```typescript
// BEFORE
const solarRadiation = this.extractSensorValues(sensors, 'PAR');

// AFTER - Match dashboard exactly
const solarRadiation = this.extractSensorValues(sensors, 'TSR');
```

### 5. Add Missing Helper Methods

Copy these from dashboard.component.ts exactly:
- `extractSensorValues()` (line 1514-1519)
- `calculateStatsValues()` (line 1521-1531)
- `groupRawDataByHour()` (line 1498-1512)
- `getSaturationVaporPressure()` (line 1533-1535)

### 6. Add Data Validation
```typescript
private validateSensorData(value: number, sensorType: string): boolean {
  const ranges: Record<string, {min: number, max: number}> = {
    'temperature': { min: -10, max: 60 },
    'humidity': { min: 0, max: 100 },
    'windSpeed': { min: 0, max: 50 },
    'solarRadiation': { min: 0, max: 1200 },
    'conductivity': { min: 0, max: 5 },  // mS/cm
    'pH': { min: 3, max: 10 }
  };

  const range = ranges[sensorType];
  if (!range) return true;  // Unknown sensor, allow

  if (value < range.min || value > range.max) {
    console.warn(`${sensorType} value ${value} out of range [${range.min}, ${range.max}]`);
    return false;
  }

  return true;
}
```

---

## Testing Checklist

After applying fixes, verify:

- [ ] Temperature values are divided by 10 (should be 15-35°C)
- [ ] Humidity data is being extracted from `HUM` or `Hum_SHT2x`
- [ ] VPD is non-zero when RH < 100%
- [ ] Wind speed uses `wind_speed_level` sensor
- [ ] Solar radiation uses `TSR` sensor (not PAR)
- [ ] Conductivity is in mS/cm (< 5)
- [ ] ET units match time aggregation (hourly vs daily)
- [ ] Out-of-range values are flagged in console

---

## Next Step: Implementation

1. **Copy helper methods** from dashboard.component.ts to Shiny
2. **Update sensor name mappings** to match dashboard exactly
3. **Add temperature `/10` conversion**
4. **Test with same raw data** in both components
5. **Verify VPD, ET calculations** produce same results
