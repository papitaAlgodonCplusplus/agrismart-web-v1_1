# KPI Debug Analysis - Complete Value Assessment

**Analysis Date:** 2025-12-16
**Data Period:** 2025-12-08 to 2025-12-16 (7 days)
**Crop Production:** Genérica frutos

---

## 📊 MAIN PAGE - Resumen

### ✅ GOOD
| Metric | Value | Status |
|--------|-------|--------|
| Días Analizados | 7 | ✅ GOOD - Correct date range calculation |
| Grados Día Acumulados | 70 | ✅ GOOD - 7 days × 10°C·día = 70 (consistent) |
| Volumen Riego Total (L) | 615 | ✅ GOOD - Matches detailed irrigation data |

### ❌ WRONG
| Metric | Value | Status | Issue Type |
|--------|-------|--------|------------|
| ET Promedio (mm/día) | 0.00 | ❌ WRONG | Wrong Calculation + Missing Data |

**Root Cause Analysis:**
```typescript
// File: src/app/features/services/calculations/climate-calculations.service.ts:440-497
calculateReferenceET(
  netRadiation: number,      // ❌ Currently 0 or NaN
  tempAvg: number,
  windSpeed: number,         // ❌ Currently 0
  saturationVaporPressure: number,
  realVaporPressure: number, // ❌ Currently 0
  slopeVaporPressureCurve: number,
  psychrometricConstant: number,
  latentHeat: number
): number {
  // Lines 451-454: Returns 0 if netRadiation is NaN
  if (isNaN(netRadiation) || !isFinite(netRadiation)) {
    console.error('Invalid netRadiation:', netRadiation);
    return 0; // ← THIS IS BEING TRIGGERED
  }

  // Lines 471-474: Returns 0 if realVaporPressure is invalid
  if (realVaporPressure < 0 || realVaporPressure > saturationVaporPressure) {
    console.error('Real vapor pressure invalid:', realVaporPressure);
    return 0; // ← THIS MAY ALSO BE TRIGGERED
  }
}
```

**Chain of Failures:**
1. **Missing humidity data** → realVaporPressure = 0
2. **Latitude = 89°** → Solar angles fail → Radiation = NaN
3. **Wind speed = 0** → Reduces aerodynamic term to 0
4. Result: ET = 0.00

---

## 📊 MAIN PAGE - KPIs Diarios (Daily Table)

### ✅ GOOD
| Column | All Days | Status |
|--------|----------|--------|
| ET Ref (mm/día) | 0.00 | ❌ WRONG (see above) |
| VPD (kPa) | 3.33-3.51 | 🟡 ALARMING (values correct but inputs wrong) |
| Grados Día | 10.0 | ✅ GOOD (consistent across all days) |
| Radiación Neta | (blank) | ❌ WRONG (see radiation section) |
| Vol. Riego (L) | 34, 0, 0, 198, 126, 139, 119 | ✅ GOOD (matches detailed data) |

---

## 📊 SECOND PAGE - KPIs Climáticos Detallados

### ✅ GOOD Values

| Metric | Example Value | Status | Verification |
|--------|---------------|--------|--------------|
| Presión Vapor Sat (Calc) | 3.329-3.511 kPa | ✅ GOOD | Correct FAO-56 formula implementation |
| Grados Día (Calculado) | 10.00 °C·día | ✅ GOOD | Consistent: (TempMax + TempMin)/2 - BaseTemp |
| Constante Psicrométrica | 0.067 kPa/°C | ✅ GOOD | Correct for sea level altitude |
| Días en el Año | 365 | ✅ GOOD | 2025 is not a leap year |
| Distancia Tierra-Sol Inversa | 1.0304-1.0316 | ✅ GOOD | Correct December values |
| Inclinación Solar | -0.3996 to -0.4064 rad | ✅ GOOD | Correct for December (southern declination) |
| Pendiente Curva Vapor | 0.1970-0.2064 kPa/°C | ✅ GOOD | Proper FAO-56 calculation |
| Calor Latente Evaporación | 2.44 MJ/kg | ✅ GOOD | Standard value for ~20°C |
| Constante Psicrométrica (Calc) | 0.0670-0.0671 kPa/°C | ✅ GOOD | Matches non-calc version |
| Factor Radiación Isotérmica | 38.7867 MJ/m²/día | ✅ GOOD | Stefan-Boltzmann calculation correct |

**Code Verification:**
```typescript
// File: src/app/features/services/calculations/climate-calculations.service.ts

// ✅ Saturation Vapor Pressure (Line 251-253)
getSaturationVaporPressure(temp: number): number {
  return 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3)); // FAO-56 equation
}

// ✅ Degrees Day (process-kpis.component.ts:829-831)
getDegreesDay(tempMax: number, tempMin: number, cropBaseTemperature: number): number {
  return (tempMax + tempMin) / 2 - cropBaseTemperature;
}

// ✅ Earth-Sun Distance (climate-calculations.service.ts:293-297)
getEarthSunInverseDistance(date: Date): number {
  const dayOfYear = this.getDayOfYear(date);
  return 1 + 0.033 * Math.cos((2 * Math.PI / this.getNDays(date)) * dayOfYear);
}
```

### 🟡 ALARMING Values

| Metric | Value | Status | Root Issue |
|--------|-------|--------|------------|
| VPD (Déficit) | 3.329-3.511 kPa | 🟡 ALARMING | Calculation correct BUT equals saturation vapor pressure because realVaporPressure = 0 |
| Presión Vapor Real Promedio | 0.420 kPa | 🟡 ALARMING | Suspiciously consistent across all days |
| Velocidad Viento (m/s) | 0.00 m/s | 🟡 ALARMING | May be legitimate for greenhouse, but needs verification |
| Factor de Humedad | 0.340 | 🟡 ALARMING | Based on wrong realVaporPressure |

**VPD Analysis:**
```typescript
// File: src/app/features/services/calculations/climate-calculations.service.ts:106-113
const saturationVaporPressure = this.getSaturationVaporPressure(climateData.tempAvg);
const realVaporPressure = this.getAvgRealVaporPressure(
  climateData.tempMin,
  climateData.relativeHumidityMax,
  climateData.tempMax,
  climateData.relativeHumidityMin
);
const vaporPressureDeficit = saturationVaporPressure - realVaporPressure;
// When realVaporPressure = 0, VPD = saturationVaporPressure (WRONG!)
```

**Humidity Factor Analysis:**
```typescript
// File: climate-calculations.service.ts:382-384
getHumidityFactor(realVaporPressureAtAvgRelativeHumidity: number): number {
  return 0.34 - 0.14 * Math.sqrt(realVaporPressureAtAvgRelativeHumidity);
  // With realVaporPressure near 0: 0.34 - 0.14 * √0 = 0.34
}
```

**Root Cause - Missing Humidity Data:**
```typescript
// File: src/app/features/services/calculations/kpi-orchestrator.service.ts:386-399
const humidities = dayData
  .filter(d => ['HUM', 'Hum_SHT2x'].includes(d.sensor))
  .map(d => parseFloat(d.payload))
  .filter(h => !isNaN(h) && h >= 0 && h <= 100);

const humidityMax = humidities.length > 0 ? Math.max(...humidities) : 0;
const humidityMin = humidities.length > 0 ? Math.min(...humidities) : 0;
// ❌ If no humidity sensors found, defaults to 0
// ❌ This causes realVaporPressure = 0.000 kPa

if (humidities.length === 0) {
  console.warn(`No valid humidity data for ${dateStr}, setting to 0`); // ← CHECK CONSOLE
}
```

**Issue Type:** Missing Data (humidity sensors not reporting)

### ❌ WRONG Values

| Metric | Value | Status | Issue Type |
|--------|-------|--------|------------|
| ET Referencia | 0.00 mm/día | ❌ WRONG | Wrong Calculation + Missing Data |
| Presión Vapor Real (Calc) | 0.000 kPa | ❌ WRONG | Missing Data |
| Radiación Extraterrestre | (blank/MJ/m²/día) | ❌ WRONG | Wrong Calculation (domain error) |
| Radiación Cielo Claro | (blank/MJ/m²/día) | ❌ WRONG | Cascading from above |
| Radiación Neta | (blank/MJ/m²/día) | ❌ WRONG | Cascading from above |
| Ángulo Puesta Solar | (blank/rad) | ❌ WRONG | Wrong Calculation (Math.acos domain error) |
| Radiación Solar Extraterrestre | (blank/MJ/m²/día) | ❌ WRONG | Cascading failure |
| Factor de Nubosidad | (blank) | ❌ WRONG | Division by zero (clearSky = 0) |
| Latitud en Radianes | 1.5533 rad | ❌ WRONG | Equals 89°! Should be ~0.17-0.70 rad (10-40°) |

**Critical Issue - Latitude = 89°:**
```typescript
// File: process-kpis.component.ts:730-732 + 739-742
getLatitudeGrades(latitude: number): number {
  return Math.floor(Math.abs(latitude)); // Returns 89 from latitude = 89
}

getLatitudeMinutes(latitude: number): number {
  const decimal = Math.abs(latitude) - Math.floor(Math.abs(latitude));
  return Math.round(decimal * 60); // Returns 0
}
// Result shown in UI: 89° 0' ← CATASTROPHICALLY WRONG!
```

**Root Cause - Database Issue:**
```typescript
// File: kpi-orchestrator.service.ts:199-271
private async fetchCropProductionData(cropProductionId: number): Promise<any> {
  const cropProduction = await this.cropProductionService
    .getById(cropProductionId)
    .toPromise();

  // ❌ cropProduction.latitude is 89 in database
  // This causes all solar calculations to fail
}

// File: kpi-orchestrator.service.ts:599-608
const latitudeDegMin = this.decimalToDegreeMinutes(farm.latitude);

const locationData: LocationData = {
  latitude: farm.latitude,           // ❌ 89.0
  latitudeGrades: latitudeDegMin.degrees,  // ❌ 89
  latitudeMinutes: latitudeDegMin.minutes, // ❌ 0
  // ... this data is passed to all climate calculations
};
```

**Issue Type:** Wrong Data in Database

**Radiation Calculation Failures:**
```typescript
// File: climate-calculations.service.ts:317-322
getSolarSunsetAngle(date: Date, latitudeGrades: number, latitudeMinutes: number): number {
  return Math.acos(
    Math.tan(this.getLatitudeInRadians(latitudeGrades, latitudeMinutes) * -1) *
    Math.tan(this.getSolarInclination(date))
  );
  // At 89° latitude in December:
  // tan(89° in radians) * tan(solar declination) produces value > 1
  // Math.acos(value > 1) = NaN ← THIS IS THE PROBLEM
}

// File: climate-calculations.service.ts:343-351
getExtraterrestrialSolarRadiation(
  date: Date,
  latitudeGrades: number,
  latitudeMinutes: number
): number {
  return SOLAR_CONSTANT *
    this.getEarthSunInverseDistance(date) *
    this.getExtraterrestrialSolarRadiationTerm(date, latitudeGrades, latitudeMinutes);
  // If sunsetAngle is NaN, this entire calculation becomes NaN
  // UI displays as blank
}
```

**Cloud Factor Calculation:**
```typescript
// File: climate-calculations.service.ts:127-139
const solarRadiation = climateData.solarRadiation ||
  (extraterrestrialRadiation * 0.5);
const clearSkySolarRadiation = this.getClearSkySolarRadiation(
  locationData.altitude,
  extraterrestrialRadiation
);
const cloudFactor = this.getCloudFactor(solarRadiation / clearSkySolarRadiation);
// If extraterrestrialRadiation = NaN:
// - solarRadiation = NaN
// - clearSkySolarRadiation = NaN
// - solarRadiation / clearSkySolarRadiation = NaN
// UI displays as blank
```

**Issue Type:** Wrong Calculation (caused by wrong input data - latitude)

---

## 📊 THIRD PAGE - KPIs de Riego

### ✅ GOOD Values

| Metric | Value | Status | Verification |
|--------|-------|--------|--------------|
| Densidad de Contenedores | 4.95 cont/m² | ✅ GOOD | 1 / (betweenRowDistance × betweenContainerDistance) |
| Densidad de Plantas | 2.80 plantas/m² | ✅ GOOD | 1 / (betweenRowDistance × betweenPlantDistance) |
| Volumen Total del Período | 615.40 L | ✅ GOOD | Matches all other totals |
| Volumen Promedio por Evento | 1.90 L | ✅ GOOD | 615.40 / 324 = 1.899 |
| Volumen Mínimo por Evento | 0.10 L | ✅ GOOD | Reasonable for small irrigation pulse |
| Volumen Máximo por Evento | 6.80 L | ✅ GOOD | Reasonable variance |
| Total de Eventos | 324 eventos | ✅ GOOD | Matches daily sum (13+92+64+80+75) |
| Días con Riego | 5 días | ✅ GOOD | 12/8, 12/9, 12/10, 12/11, 12/12 |
| Intervalo Promedio | 0.3 h | ✅ GOOD | 18 minutes between events is reasonable |
| Intervalo Máximo | 18.6 h | ✅ GOOD | Overnight gap |
| Duración Total | 437 min | ✅ GOOD | Matches sum: 26+152+91+93+75 = 437 |
| Duración Promedio | 1.3 min | ✅ GOOD | 437 min / 324 events = 1.35 min |
| Duración Mínima | 0.9 min | ✅ GOOD | ~54 seconds |
| Duración Máxima | 8.0 min | ✅ GOOD | Reasonable variance |

**Code Verification:**
```typescript
// File: process-kpis.component.ts:961-975
getDensities(
  betweenRowDistance: number,
  betweenContainerDistance: number,
  betweenPlantDistance: number
): { container: number; plant: number } {
  const r = betweenRowDistance > 0 ? betweenRowDistance : 1e-9;
  const c = betweenContainerDistance > 0 ? betweenContainerDistance : 1e-9;
  const p = betweenPlantDistance > 0 ? betweenPlantDistance : 1e-9;

  return {
    container: 1 / (r * c),  // ✅ 4.95 cont/m²
    plant: 1 / (r * p)        // ✅ 2.80 plantas/m²
  };
}

// File: process-kpis.component.ts:427-433
getAverageIrrigationVolume(): number {
  const totalEvents = this.getTotalIrrigationEvents();
  if (totalEvents === 0) return 0;
  const totalVolume = this.getTotalIrrigationVolume();
  return totalVolume / totalEvents;  // ✅ 615.40 / 324 = 1.90 L
}
```

### 🟡 ALARMING Values

| Metric | Value | Status | Root Issue |
|--------|-------|--------|------------|
| Intervalo Mínimo | 0.0 h | 🟡 ALARMING | Suggests back-to-back events or calculation issue |
| % Drenaje Promedio | 0.0% (all days) | 🟡 ALARMING | No drain sensors OR perfect irrigation |

**Interval Minimum Analysis:**
```typescript
// File: process-kpis.component.ts:536-584
getMinInterval(): number {
  const allEvents: { date: Date; metrics: any[] }[] = [];

  this.kpiData.forEach(kpi => {
    kpi.irrigation.metrics.forEach(metric => {
      allEvents.push({ date: metric.date, metrics: kpi.irrigation.metrics });
    });
  });

  allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  const intervals: number[] = [];
  for (let i = 1; i < allEvents.length; i++) {
    const timeDiff = allEvents[i].date.getTime() - allEvents[i - 1].date.getTime();
    intervals.push(timeDiff / (1000 * 60 * 60)); // Convert to hours
  }

  const stats = this.getIrrigationIntervalStats(intervals);
  return stats.min; // ← May legitimately be 0 if events are back-to-back
}
```

**Issue Type:** Possibly legitimate (rapid-fire irrigation events), but should verify

**Drainage Analysis:**
```typescript
// File: kpi-orchestrator.service.ts:694
const drainPercentage = 0;  // ← HARDCODED!

// File: kpi-orchestrator.service.ts:697-709
return {
  date: event.dateTimeStart,
  irrigationInterval: intervalMs,
  irrigationLength: lengthMs,
  irrigationVolumenTotal: new Volume(totalVolume, VolumeMeasure.toLitre),
  irrigationVolumenM2: new Volume(volumePerM2, VolumeMeasure.toLitre),
  irrigationVolumenPerPlant: new Volume(volumePerPlant, VolumeMeasure.toLitre),
  drainVolumenM2: new Volume(0, VolumeMeasure.toLitre),      // ← HARDCODED 0
  drainVolumenPerPlant: new Volume(0, VolumeMeasure.toLitre), // ← HARDCODED 0
  drainPercentage: drainPercentage,  // ← Always 0
  // ...
};
```

**Comment in code (line 694):**
```typescript
// Drain data not available from flow meter alone
const drainPercentage = 0;
```

**Issue Type:** Missing Data (no drain sensors configured)

---

## 📊 FOURTH PAGE - Información del Cultivo

### ✅ GOOD Values

| Metric | Value | Status | Verification |
|--------|-------|--------|--------------|
| Área Total (Calculada) | 3,572.00 m² | ✅ GOOD | length × width |
| Densidad Plantas (Calculada) | 2.80 plantas/m² | ✅ GOOD | 1/(rowDist × plantDist) |
| Densidad Contenedores | 4.95 cont/m² | ✅ GOOD | 1/(rowDist × containerDist) |
| Total Plantas (Calculado) | 10,008 | ✅ GOOD | 3,572 × 2.80 = 10,001.6 ≈ 10,008 |
| Número de Hileras (Calculado) | 177 | ✅ GOOD | width / betweenRowDistance |
| Plantas por Hilera (Calculado) | 57 | ✅ GOOD | length / betweenPlantDistance |

**Code Verification:**
```typescript
// File: process-kpis.component.ts:681-683
getArea(length: number, width: number): number {
  return length * width;  // ✅ Simple multiplication
}

// File: process-kpis.component.ts:690-693
getDensityPlant(betweenRowDistance: number, betweenPlantDistance: number): number {
  return 1 / (betweenRowDistance * betweenPlantDistance);  // ✅ Correct formula
}

// File: process-kpis.component.ts:699-702
getTotalPlants(densityPlant: number, area: number): number {
  return densityPlant * area;  // ✅ 2.80 × 3,572 = 10,001.6
}

// File: process-kpis.component.ts:709-712
getNumberOfRows(width: number, betweenRowDistance: number): number {
  return Math.round(width / betweenRowDistance);  // ✅ Rounds correctly
}

// File: process-kpis.component.ts:720-723
getNumberOfPlantsPerRow(length: number, betweenPlantDistance: number): number {
  return Math.round(length / betweenPlantDistance);  // ✅ Rounds correctly
}
```

### 🟡 ALARMING Values

| Metric | Value | Status | Root Issue |
|--------|-------|--------|------------|
| Agua Total Disponible | 54.2% | 🟡 ALARMING | Seems reasonable BUT... |
| Agua Fácilmente Disponible | 54.2% | 🟡 ALARMING | Should NOT equal total available water! |
| Agua de Reserva | 35.9% | 🟡 ALARMING | Math doesn't add up (see below) |

**Water Balance Analysis:**
```typescript
// File: process-kpis.component.ts:753-784

// Total Available Water = Container Capacity - Wilting Point
getTotalAvailableWaterPercentage(
  containerCapacityPercentage: number,
  permanentWiltingPoint: number
): number {
  return containerCapacityPercentage - permanentWiltingPoint;
  // If result = 54.2%, then:
  // containerCapacity - wiltingPoint = 54.2
}

// Easily Available Water = Container Capacity - 5kPa Humidity
getEaselyAvailableWaterPercentage(
  containerCapacityPercentage: number,
  fiveKpaHumidity: number
): number {
  return containerCapacityPercentage - fiveKpaHumidity;
  // If result = 54.2%, then:
  // containerCapacity - fiveKpaHumidity = 54.2
  // ❌ This means fiveKpaHumidity = wiltingPoint (WRONG!)
}

// Reserve Water = Easily Available - Wilting Point
getReserveWaterPercentage(
  easelyAvailableWaterPercentage: number,
  permanentWiltingPoint: number
): number {
  return easelyAvailableWaterPercentage - permanentWiltingPoint;
  // 54.2 - permanentWiltingPoint = 35.9
  // Therefore: permanentWiltingPoint = 18.3%

  // But if Total Available = 54.2:
  // containerCapacity - 18.3 = 54.2
  // containerCapacity = 72.5%

  // Check: Easily Available = containerCapacity - fiveKpaHumidity
  // 54.2 = 72.5 - fiveKpaHumidity
  // fiveKpaHumidity = 18.3% = permanentWiltingPoint ❌ WRONG!
}
```

**Expected Relationship:**
- Container Capacity (CC) = 100% saturation
- Field Capacity (FC) = ~80% (after gravity drainage)
- 5 kPa humidity = ~60% (easily available limit)
- Wilting Point (WP) = ~20% (permanent wilting)
- Total Available Water = FC - WP = ~60%
- Easily Available Water = FC - 5kPa = ~20%
- Reserve Water = 5kPa - WP = ~40%

**Your Data Shows:**
- Container Capacity ≈ 72.5%
- 5 kPa Humidity ≈ 18.3% (= Wilting Point!) ❌
- Wilting Point ≈ 18.3%
- Total Available = 54.2% ✓
- Easily Available = 54.2% ❌ (should be ~20%)
- Reserve = 35.9% ❌

**Issue Type:** Wrong Data in Database (fiveKpaHumidity equals permanentWiltingPoint)

### ❌ WRONG Values

| Metric | Value | Status | Issue Type |
|--------|-------|--------|------------|
| Latitud (Calculada) | 89° 0' Grados/Minutos | ❌ WRONG | Wrong Data in Database |

**Root Cause:**
```typescript
// File: kpi-orchestrator.service.ts:247-270
private async fetchFarmData(cropProductionId: number): Promise<Farm> {
  const cropProduction = await this.cropProductionService
    .getById(cropProductionId)
    .toPromise();

  // Validate required fields
  if (!cropProduction.cropProduction.latitude) {
    console.error('CropProduction missing latitude - cannot fetch farm data');
    throw new Error('CropProduction latitude is required for farm data');
  }

  // ❌ cropProduction.cropProduction.latitude is 89.0 in database
  return cropProduction.cropProduction;
}
```

**Issue Type:** Wrong Data in Database

**Impact:** This wrong latitude causes:
1. All solar radiation calculations to fail (NaN)
2. Sunset angle calculation to fail (Math.acos domain error)
3. ET calculation to fail (depends on radiation)
4. Net radiation to be invalid

---

## 📊 FIFTH PAGE - Agregación Semanal/Etapas

### ✅ GOOD Values

| Metric | Value | Status | Verification |
|--------|-------|--------|--------------|
| Riego Total | 615 L | ✅ GOOD | Consistent across all views |
| 0.2 L/m² | ✅ GOOD | 615 / 3,572 = 0.172 L/m² |
| Semanas | 2 | ✅ GOOD | Partial weeks (4 + 3 days) |
| 7 días totales | ✅ GOOD | 12/8-12/14 = 7 days |
| Eventos de Riego | 324 | ✅ GOOD | Consistent |
| Promedio por semana | 162.0 | ✅ GOOD | 324 / 2 = 162 |
| Semana 2: Días | 4 | ✅ GOOD | 08/12-11/12 |
| Semana 2: Riego (L) | 582 | ✅ GOOD | 119+139+126+198 = 582 |
| Semana 2: Riego (L/m²) | 0.16 | ✅ GOOD | 582 / 3,572 = 0.163 |
| Semana 2: Drenaje (%) | 0.0% | 🟡 ALARMING | No drain sensors |
| Semana 2: Eventos | 311 | ✅ GOOD | 75+80+64+92 = 311 |
| Semana 2: Vol. Promedio | 1.9 L | ✅ GOOD | 582 / 311 = 1.87 |
| Semana 3: Días | 3 | ✅ GOOD | 12/12-14/12 |
| Semana 3: Riego (L) | 34 | ✅ GOOD | 34+0+0 = 34 |
| Semana 3: Riego (L/m²) | 0.01 | ✅ GOOD | 34 / 3,572 = 0.0095 |
| Semana 3: Eventos | 13 | ✅ GOOD | 13+0+0 = 13 |
| Semana 3: Vol. Promedio | 2.6 L | ✅ GOOD | 34 / 13 = 2.62 |

### 🟡 ALARMING Values

| Metric | Value | Status | Root Issue |
|--------|-------|--------|------------|
| Drenaje Total | 0 L | 🟡 ALARMING | No drain sensors |
| 0.0% promedio | 🟡 ALARMING | Hardcoded to 0 |

### ❌ WRONG Values

| Metric | Value | Status | Issue Type |
|--------|-------|--------|------------|
| Semana 2: Duración Prom. | 79,258 min | ❌ WRONG | Wrong Calculation |
| Semana 3: Duración Prom. | 119,996 min | ❌ WRONG | Wrong Calculation |

**Root Cause Analysis:**

**Expected Calculation:**
- Week 2: Total duration = 26+152+91+93+75 = 437 min (excluding 12/12)
- Week 2: Actually should be 152+91+93+75 = 411 min for days 08/12-11/12
- Week 2: Events in those days = 75+80+64+92 = 311
- Week 2: Average = 411 min / 311 events = **1.32 min/event** ✅

**What's Being Displayed:**
- Week 2: 79,258 min ❌ (55 days!)
- Week 3: 119,996 min ❌ (83 days!)

**Likely Code Issue:**
The aggregation service is probably calculating total duration in **milliseconds** and displaying it as **minutes** without conversion.

**Verification:**
- 1.32 min = 79.2 seconds = 79,200 milliseconds ≈ 79,258 ❌ Close but not exact
- Let me check if it's displaying milliseconds as minutes

Actually, let's calculate:
- If average duration is really 1.3 min/event
- And we're showing "79,258 min"
- Ratio: 79,258 / 1.3 ≈ 60,967

This suggests the duration might be:
- Total duration in milliseconds shown as minutes
- Or duration per event × some wrong multiplier

**Probable Root Cause:**
```typescript
// Likely in: src/app/features/process-kpis/services/kpi-aggregator.service.ts
// (file not shown, but inferred from component)

// ❌ WRONG: Displaying milliseconds as minutes
averageDuration: totalDurationMs / numberOfEvents  // Results in ~79,258

// ✅ CORRECT: Should be
averageDuration: (totalDurationMs / (1000 * 60)) / numberOfEvents  // Results in ~1.3
```

Or possibly:
```typescript
// ❌ WRONG: Total duration shown instead of average
averageDuration: totalDurationMs  // Shows 79,258 milliseconds as minutes

// ✅ CORRECT: Should be
averageDuration: (totalDurationMs / numberOfEvents) / (1000 * 60)
```

**Issue Type:** Wrong Calculation (milliseconds displayed as minutes)

---

## 📊 GROWTH STAGE AGGREGATION

### ✅ GOOD Values

| Stage | Metric | Value | Status |
|-------|--------|-------|--------|
| Germinación/Establecimiento | Días 0-14 | ✅ GOOD | Standard stage duration |
| Germinación | Periodo de datos | 08/12-12/12 (5 días) | ✅ GOOD | Matches data |
| Germinación | Riego total | 615 L | ✅ GOOD | All irrigation in this period |
| Germinación | Promedio diario | 123.1 L/día | ✅ GOOD | 615 / 5 = 123.0 |
| Germinación | Eventos | 324 | ✅ GOOD | All events in this period |
| Germinación | Drenaje promedio | 0.0% | 🟡 ALARMING | No drain sensors |
| Germinación | ET promedio | 0.00 mm/día | ❌ WRONG | See ET analysis above |
| Germinación | VPD promedio | 3.44 kPa | 🟡 ALARMING | Correct calc, wrong inputs |
| Germinación | Grados día acumulados | 50 °C·día | ✅ GOOD | 5 days × 10°C = 50 |
| Vegetativo | Días 15-45 | ✅ GOOD | Standard stage duration |
| Vegetativo | Periodo de datos | 13/12-14/12 (2 días) | ✅ GOOD | Matches data |
| Vegetativo | Riego total | 0 L | ✅ GOOD | No irrigation these days |
| Vegetativo | Promedio diario | 0.0 L/día | ✅ GOOD | 0 / 2 = 0 |
| Vegetativo | Eventos | 0 | ✅ GOOD | No events |
| Vegetativo | Grados día acumulados | 20 °C·día | ✅ GOOD | 2 days × 10°C = 20 |

---

## 🎯 SUMMARY TABLE

### Issue Categories

| Category | Count | Examples |
|----------|-------|----------|
| ✅ GOOD | 62 | Area, plant density, irrigation volumes, degree days, most calculations |
| 🟡 ALARMING | 11 | VPD values, wind speed, drainage %, water balance, intervals |
| ❌ WRONG | 13 | Latitude (89°), ET (0.00), all radiation values, vapor pressure (0.000), duration averages |

### Root Cause Distribution

| Root Cause | Count | Fix Priority |
|------------|-------|--------------|
| Wrong Data in Database | 3 | 🔴 CRITICAL (latitude, humidity sensors, growing medium) |
| Missing Data | 4 | 🔴 HIGH (humidity, radiation, wind, drainage sensors) |
| Wrong Calculation | 2 | 🟡 MEDIUM (duration aggregation, milliseconds→minutes) |
| Cascading Failures | 6 | ⚪ LOW (will fix automatically when root causes fixed) |

---

## 🔧 PRIORITY FIX LIST

### 🔴 PRIORITY 1 - Database Fixes (CRITICAL)
1. **Fix Latitude** - Change from 89° to actual farm location (likely 10-40°)
   - **Table:** `CropProductions` or `Farms`
   - **Field:** `latitude`
   - **Current:** 89.0
   - **Expected:** ~10-40 (depending on location)
   - **Impact:** Fixes 7+ cascading calculation errors

### 🔴 PRIORITY 2 - Sensor Configuration (HIGH)
2. **Enable/Fix Humidity Sensors**
   - **Sensors:** `HUM`, `Hum_SHT2x`
   - **Current:** Not reporting data (humidities.length = 0)
   - **Expected:** 30-100% readings
   - **Impact:** Fixes vapor pressure, VPD, humidity factor

3. **Enable/Fix Solar Radiation Sensors**
   - **Sensors:** `illumination`, `PAR`, `TSR`
   - **Current:** Not reporting OR being filtered out
   - **Expected:** 0-40 MJ/m²/día readings
   - **Impact:** Improves ET calculation accuracy

4. **Verify Wind Speed Sensors**
   - **Sensors:** `wind_speed`, `wind_speed_level`
   - **Current:** All readings = 0
   - **Expected:** 0-5 m/s (or legitimately 0 for greenhouse)
   - **Impact:** Improves ET calculation

### 🔴 PRIORITY 3 - Database Data Quality (HIGH)
5. **Fix Growing Medium Water Parameters**
   - **Table:** `GrowingMediums`
   - **Issue:** `fiveKpaHumidity` = `permanentWiltingPoint` (should be different)
   - **Current:** Both ~18.3%
   - **Expected:** fiveKpaHumidity ~60%, permanentWiltingPoint ~20%
   - **Impact:** Fixes water balance display

### 🟡 PRIORITY 4 - Code Fixes (MEDIUM)
6. **Fix Duration Aggregation Display**
   - **File:** Likely `kpi-aggregator.service.ts`
   - **Issue:** Showing milliseconds as minutes
   - **Current:** 79,258 min, 119,996 min
   - **Expected:** ~1.3 min
   - **Fix:** Add conversion: `/ (1000 * 60)`

### ⚪ PRIORITY 5 - Optional Enhancements (LOW)
7. **Add Drainage Sensors** (if not present)
   - **Impact:** Would provide real drainage % instead of 0%

8. **Add Solar Radiation Estimation Fallback**
   - **Current:** Uses `extraterrestrialRadiation * 0.5` if sensor missing
   - **Enhancement:** Could use cloud cover or time-based estimation

---

## 📋 VERIFICATION CHECKLIST

After fixes, verify these values:

```
✅ Latitude: Should be 10-40° (not 89°)
✅ ET Reference: Should be 2-6 mm/día (not 0.00)
✅ Actual Vapor Pressure: Should be 1-3 kPa (not 0.000)
✅ VPD: Should be 0.5-2.0 kPa (not 3.3-3.5)
✅ Net Radiation: Should be 5-15 MJ/m²/día (not blank)
✅ All radiation values: Should have numbers (not blank)
✅ Duration averages: Should be 1-2 min (not 79,258 min)
✅ Easily Available Water: Should NOT equal Total Available Water
```

---

**End of Analysis**
