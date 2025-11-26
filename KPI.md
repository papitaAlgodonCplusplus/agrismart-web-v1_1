# AgriSmart Calculator - Function Inventory (KPI)

## 1. CALCULUS FUNCTIONS
*Functions that calculate data, generate outputs, or make decisions*

### Calculations.cs
- `Calculate` - Main calculation orchestrator that processes date ranges, combines climate data, irrigation metrics, and growing medium data to calculate crop evapotranspiration

### CalculationsIrrigation.cs
- `GetIrrigationMetrics` - Retrieves and calculates irrigation metrics for all irrigation events on a specific date
- `CalculateIrrigationCalculationOutput` - Calculates comprehensive irrigation metrics including interval, length, volumes per m², per plant, total, drainage percentages, flow rate, and precipitation rate

### CalculationsClimate.cs
- `Calculate` - Main method that calculates comprehensive climate KPIs including evapotranspiration, vapor pressure, solar radiation, and light integrals based on FAO-56 Penman-Monteith equations
- `getSaturationVaporPressure` - Calculates saturation vapor pressure from temperature
- `getRealVaporPressure` - Calculates real vapor pressure from temperature and relative humidity
- `getAvgRealVaporPressure` - Calculates average real vapor pressure from min/max temperatures and humidities
- `getNDays` - Returns number of days in year (accounts for leap years)
- `getEarthSunInverseDistance` - Calculates Earth-Sun inverse distance for solar radiation calculations
- `getLatitudeInRadians` - Converts latitude from degrees and minutes to radians
- `getSolarInclination` - Calculates solar declination angle for given date
- `getSolarSunsetAngle` - Calculates sunset hour angle based on latitude and solar declination
- `getExtraterrestrialSolarRadiationTerm` - Calculates extraterrestrial solar radiation term
- `getIsothermalLongwaveRadiationFactor` - Calculates isothermal longwave radiation factor from temperatures
- `getHumidityFactor` - Calculates humidity correction factor for longwave radiation
- `getCloudFactor` - Calculates cloud cover correction factor
- `getWindSpeedAsMtsPerSecond` - Converts and adjusts wind speed to standard measurement height
- `getSlopeVaporPressureCurve` - Calculates slope of saturation vapor pressure curve
- `getLatentHeatEvaporation` - Calculates latent heat of evaporation
- `getPsychrometricConstant` - Calculates psychrometric constant based on altitude
- `getDegreesDay` - Calculates degree days for crop development

### GlobalOutput.cs
- `getIrrigationIntervalStats` - Calculates statistical metrics (min, max, average, sum) for irrigation intervals, optionally excluding first event
- `getIrrigationLengthStats` - Calculates statistical metrics (min, max, average, sum) for irrigation event durations
- `getIrrigationVolumenSum` - Calculates total sum of irrigation volumes across all metrics
- `getIrrigationVolumenMin` - Returns minimum irrigation volume from all irrigation metrics
- `getIrrigationVolumenMax` - Returns maximum irrigation volume from all irrigation metrics
- `getIrrigationVolumenAvg` - Calculates average irrigation volume across all irrigation metrics

### Volume.cs
- `getVolume` - Converts volume value based on measurement type (none, litres, cubic metres)

### CesarFertilizerCalculator.cs
- `EToCalculation` - Simple evapotranspiration calculation (temperature × humidity > 0)

**Total Calculus Functions: 29**

---

## 2. API FUNCTIONS
*Functions that interact with the database or external APIs via GET, POST, PUT, DELETE operations*

### AgriSmartApiClient.cs

#### Authentication
- `CreateSession` - POST: Authenticates user with credentials and returns authentication token

#### Client & Company Management (GET operations)
- `GetClients` - GET: Retrieves all clients from the system
- `GetCompanies` - GET: Retrieves all companies
- `GetFarms` - GET: Retrieves farms filtered by company ID
- `GetProductionUnits` - GET: Retrieves production units filtered by farm ID
- `GetCropProductions` - GET: Retrieves crop productions filtered by production unit ID
- `GetCrops` - GET: Retrieves all crops
- `GetCrop` - GET: Retrieves specific crop by ID

#### Device Management
- `GetDevices` - GET: Retrieves devices associated with a crop production
- `ProcessDeviceRawDataClimateMeasurements` - POST: Processes raw device data for climate measurements

#### Measurement Variables
- `GetMeasurementVariablesStandard` - GET: Retrieves standard measurement variable definitions
- `GetMeasurementVariables` - GET: Retrieves measurement variables filtered by catalog ID

#### Measurements & Data
- `GetMeasurements` - GET: Retrieves measurement data for specific crop production, variable, and date range
- `GetMeasurementKPIs` - GET: Retrieves measurement KPIs for specific crop production and date range
- `GetLastMeasurementKPI` - GET: Retrieves the most recent measurement KPI for a crop production

#### Irrigation Data
- `GetIrrigationEvents` - GET: Retrieves irrigation events for specific crop production within date range
- `GetIrrigationMeasurements` - GET: Retrieves irrigation measurements for specific crop production within date range
- `GetCropProductionIrrigationSector` - GET: Retrieves irrigation sector data by sector ID

#### Production Components
- `GetContainer` - GET: Retrieves container information by container ID
- `GetDropper` - GET: Retrieves dropper information by dropper ID
- `GetGrowingMedium` - GET: Retrieves growing medium information by growing medium ID

**Total API Functions: 22**

---

## 3. OTHERS
*Orchestration, workflow, control, and infrastructure functions*

### Background Workers & Orchestration

#### WorkerCalculator.cs
- `ExecuteAsync` - Background service that runs periodically (10-second intervals) to execute calculation processes

#### CalculationsProcess.cs
- `CreateApiSession` - Creates API session with hardcoded credentials ("agronomicProcess", "123")
- `CalculationCalculate` - Orchestrates complete calculation workflow: retrieves hierarchical farm data (companies → farms → production units → crop productions), gathers climate/growing medium/irrigation data, and triggers calculations

#### Calculate.cs
- `CalculateClimateMeasurements` - Orchestrates climate measurements calculation for a list of crop productions

### Business Entity Management

#### BusinessEntity.cs
- `CreateApiSession` - Creates API session with authentication
- `CreateBusinessEntity` - Orchestrates loading of complete business entity hierarchy
- `LoadCompanies` - Private method to load all companies
- `LoadFarms` - Private method to load farms for each company
- `LoadProductionUnits` - Private method to load production units for each farm
- `LoadCropProductions` - Private method to load crop productions for each production unit
- `LoadDevices` - Private method to load devices for each crop production
- `GetDevices` - Returns flattened list of all devices across all crop productions
- `GetCropProductions` - Returns flattened list of all crop productions across all production units

### Entity Helpers

#### IrrigationEventEntity.cs
- `AddIrrigationMeasurement` - Adds an irrigation measurement entity to the event's collection

### Utility Functions

#### ObjectExtensions.cs
- `CopyPropertiesFrom<T>` - Generic extension method to copy properties from source to target object of same type
- `CopyPropertiesFrom<TSource, TTarget>` - Generic extension method to copy matching properties between different types

### Infrastructure

#### CesarFertilizerCalculator.cs
- `Dispose` - Implements IDisposable pattern for resource cleanup

#### AgriSmartApiClient.cs
- `Dispose` - Implements IDisposable pattern for HttpClient cleanup

**Total Other Functions: 18**

---

## SUMMARY STATISTICS

| Category | Count | Percentage |
|----------|-------|------------|
| **CALCULUS FUNCTIONS** | 29 | 42% |
| **API FUNCTIONS** | 22 | 32% |
| **OTHERS** | 18 | 26% |
| **TOTAL** | **69** | **100%** |

### Breakdown by Subcategory:

**CALCULUS:**
- Main Calculation Orchestrators: 2
- Irrigation Metrics & Statistics: 7
- Climate Calculations (FAO-56 based): 18
- Volume & Unit Conversions: 2

**API:**
- Authentication: 1
- Client & Company Management: 8
- Device Management: 2
- Measurement Variables: 2
- Measurements & Data: 3
- Irrigation Data: 3
- Production Components: 3

**OTHERS:**
- Background Workers: 1
- Orchestration/Process Management: 3
- Business Entity Management: 9
- Entity Helpers: 1
- Utility Functions: 2
- Infrastructure (Dispose): 2

---

## KEY OBSERVATIONS

### Calculation Pipeline
The main calculation flow follows this pattern:
1. **Data Collection** (API Functions) → Retrieve climate, irrigation, and growing medium measurements
2. **Data Processing** (Calculus Functions) → Calculate irrigation metrics, climate KPIs, evapotranspiration
3. **Data Orchestration** (Others) → Coordinate the workflow through background workers

### Climate Calculations
The climate calculation engine implements the FAO-56 Penman-Monteith equation for reference evapotranspiration, including:
- Solar radiation calculations
- Vapor pressure computations
- Atmospheric resistance modeling
- Wind speed adjustments

### Irrigation Analytics
Irrigation calculations provide comprehensive metrics:
- Volume calculations (per m², per plant, total)
- Flow rates and precipitation rates
- Drainage percentages
- Time-based statistics (intervals, durations)

### Architecture Pattern
The codebase follows a clear separation of concerns:
- **Services Layer**: API communication (AgriSmartApiClient)
- **Logic Layer**: Calculations and business logic
- **Entities Layer**: Data models and helpers
- **Workers**: Background processing and orchestration

---

# TYPESCRIPT EQUIVALENTS - CALCULUS FUNCTIONS

## Type Definitions

```typescript
// Enums
enum VolumeMeasure {
  None = 'none',
  ToLitre = 'toLitre',
  ToCubicMetre = 'toCubicMetre'
}

// Interfaces
interface Volume {
  value: number;
  volumeMeasureType: VolumeMeasure;
  getValue(): number;
}

interface IrrigationMetric {
  date: Date;
  irrigationInterval: number; // milliseconds
  irrigationLength: number; // milliseconds
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

interface IrrigationEventEntity {
  id: number;
  recordDateTime: Date;
  cropProductionId: number;
  dateTimeStart: Date;
  dateTimeEnd: Date;
  irrigationMeasurements: IrrigationMeasurementEntity[];
}

interface IrrigationMeasurementEntity {
  measurementVariableId: number;
  recordValue: number;
}

interface CropProductionEntity {
  id: number;
  betweenRowDistance: number;
  betweenContainerDistance: number;
  betweenPlantDistance: number;
  area: number;
  container: ContainerEntity;
  latitudeGrades: number;
  latitudeMinutes: number;
  altitude: number;
  windSpeedMeasurementHeight: number;
}

interface ContainerEntity {
  volume: Volume;
}

interface MeasurementVariable {
  id: number;
  measurementVariableStandardId: number;
}

interface Measurement {
  recordDate: Date;
  measurementVariableId: number;
  minValue: number;
  maxValue: number;
  avgValue: number;
}

interface KPIsOutput {
  date: Date;
  tempMin: number;
  tempMax: number;
  tempAvg: number;
  relativeHumidtyMin: number;
  relativeHumidtyMax: number;
  relativeHumidtyAvg: number;
  windSpeed: number;
  saturationVaporPressureAtMinTemp: number;
  saturationVaporPressureAtMaxTemp: number;
  saturationVaporPressureAtAvgTemp: number;
  realVaporPressureAtMaxRelativeHumidity: number;
  realVaporPressureAtMinRelativeHumidity: number;
  realVaporPressureAtAvgRelativeHumidity: number;
  vaporPressureDeficitAtMaxTemp: number;
  vaporPressureDeficitAtMimTemp: number;
  vaporPressureDeficitAtAvgTemp: number;
  extraTerrestrialRadiationAsEnergy: number;
  extraTerrestrialRadiationAsWater: number;
  incidentSolarRadiation: number;
  solarRadiationForAClearDay: number;
  netShortwaveSolarRadiation: number;
  netLongwaveSolarRadiation: number;
  netSolarRadiation: number;
  aerodynamicResistance: number;
  referenceCropSurfaceResistance: number;
  evapotranspirationRadiationTerm: number;
  aerodynamicEvapotranspirationRadiationTerm: number;
  evapotranspirationReferencePenmanMontiehtFAO56: number;
  evapotranspirationReferenceHargreaves: number;
  lightIntegralPAR: number;
  lightIntegralGlobal: number;
  cropEvapoTranspiration: number;
  latitudeInGrades: number;
  latitudeInMinutes: number;
  altitude: number;
  windSpeedMeasurementHeight: number;
}

interface TimeSpanMetricStat {
  min: number; // milliseconds
  max: number; // milliseconds
  average: number; // milliseconds
  sum: number; // milliseconds
}

interface GlobalOutput {
  cropProduction: CropProductionEntity;
  date: Date;
  kpis: KPIsOutput[];
  irrigationMetrics: IrrigationMetric[];
}

interface CalculationInput {
  startingDate: Date;
  endingDate: Date;
  cropProduction: CropProductionEntity;
  measurementVariables: MeasurementVariable[];
  climateData: Measurement[];
  growingMediumData: Measurement[];
  irrigationData: IrrigationEventEntity[];
  currentDateTimeMeasurementKPIs?: any[];
}
```

---

## 1. Volume.cs → Volume.ts

### getVolume

```typescript
class VolumeClass implements Volume {
  value: number;
  volumeMeasureType: VolumeMeasure;

  constructor(value: number, measure: VolumeMeasure) {
    this.value = value;
    this.volumeMeasureType = measure;
  }

  getValue(): number {
    switch (this.volumeMeasureType) {
      case VolumeMeasure.None:
        return this.value;
      case VolumeMeasure.ToLitre:
        return this.value / 1000;
      case VolumeMeasure.ToCubicMetre:
        return this.value / 1000000;
      default:
        return 0;
    }
  }
}
```

---

## 2. CesarFertilizerCalculator.cs → CesarFertilizerCalculator.ts

### EToCalculation

```typescript
function eToCalculation(temperatura: number, humidity: number): boolean {
  return temperatura * humidity > 0;
}
```

---

## 3. CalculationsClimate.cs → CalculationsClimate.ts

### Constants

```typescript
const SOLAR_CONSTANT = 0.082 * (24 * 60 / Math.PI);
const ALBEDO_CONSTANT = 0.23;
const STEFANBOLTZMANN_CONSTANT = 0.000000004903;
const EARTH_SUN_INVERSE_DISTANCE_CONSTANT = 0.033;
const REFERENCE_CROP_SURFACE_RESISTANCE_CONSTANT = 70;
const SPECIFIC_HEAT_AT_CONSTANT_PRESSURE_CONSTANT = 0.001013;
const MOLECULAR_WEIGHT_RATIO_OF_WATER_VAPOR_DRY_AIR = 0.622;
```

### getSaturationVaporPressure

```typescript
function getSaturationVaporPressure(temp: number): number {
  return 0.6108 * Math.exp(17.27 * temp / (temp + 237.3));
}
```

### getRealVaporPressure

```typescript
function getRealVaporPressure(temp: number, relativeHumidity: number): number {
  return getSaturationVaporPressure(temp) * relativeHumidity / 100;
}
```

### getAvgRealVaporPressure

```typescript
function getAvgRealVaporPressure(
  tempMin: number,
  relativeHumidityMax: number,
  tempMax: number,
  relativeHumidityMin: number
): number {
  return getRealVaporPressure(tempMin, relativeHumidityMax) +
         getRealVaporPressure(tempMax, relativeHumidityMin) / 2;
}
```

### getNDays

```typescript
function getNDays(date: Date): number {
  const year = date.getFullYear();
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  return isLeapYear ? 366 : 365;
}
```

### getEarthSunInverseDistance

```typescript
function getEarthSunInverseDistance(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  return 1 + EARTH_SUN_INVERSE_DISTANCE_CONSTANT *
         Math.cos(2 * Math.PI / getNDays(date) * dayOfYear);
}

// Helper function
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}
```

### getLatitudeInRadians

```typescript
function getLatitudeInRadians(latitudeGrades: number, latitudeMinutes: number): number {
  return Math.PI / 180 * (latitudeGrades + latitudeMinutes / 60);
}
```

### getSolarInclination

```typescript
function getSolarInclination(date: Date): number {
  const dayOfYear = getDayOfYear(date);
  return 0.409 * Math.sin(2 * Math.PI / getNDays(date) * dayOfYear - 1.39);
}
```

### getSolarSunsetAngle

```typescript
function getSolarSunsetAngle(
  date: Date,
  latitudeGrades: number,
  latitudeMinutes: number
): number {
  return Math.acos(
    Math.tan(getLatitudeInRadians(latitudeGrades, latitudeMinutes) * -1) *
    Math.tan(getSolarInclination(date))
  );
}
```

### getExtraterrestrialSolarRadiationTerm

```typescript
function getExtraterrestrialSolarRadiationTerm(
  date: Date,
  latitudeGrades: number,
  latitudeMinutes: number
): number {
  return getSolarSunsetAngle(date, latitudeGrades, latitudeMinutes) *
         Math.sin(getLatitudeInRadians(latitudeGrades, latitudeMinutes)) *
         Math.sin(getSolarInclination(date) +
         Math.cos(getLatitudeInRadians(latitudeGrades, latitudeMinutes) *
         Math.cos(getSolarInclination(date)) *
         Math.sin(getSolarSunsetAngle(date, latitudeGrades, latitudeMinutes))));
}
```

### getIsothermalLongwaveRadiationFactor

```typescript
function getIsothermalLongwaveRadiationFactor(tempMax: number, tempMin: number): number {
  return STEFANBOLTZMANN_CONSTANT *
         ((Math.pow(tempMax + 273.16, 4) + Math.pow(tempMin + 273.16, 4)) / 2);
}
```

### getHumidityFactor

```typescript
function getHumidityFactor(realVaporPressureAtAvgRelativeHumidity: number): number {
  return 0.34 - 0.14 * Math.sqrt(realVaporPressureAtAvgRelativeHumidity);
}
```

### getCloudFactor

```typescript
function getCloudFactor(relraIrsO: number): number {
  return 1.35 * relraIrsO - 0.35;
}
```

### getWindSpeedAsMtsPerSecond

```typescript
function getWindSpeedAsMtsPerSecond(
  windSpeed: number,
  windSpeedMeasurementHeight: number
): number {
  return windSpeed * (1000.0 / 3600.0) *
         (4.87 / Math.log(67.8 * windSpeedMeasurementHeight - 5.42));
}
```

### getSlopeVaporPressureCurve

```typescript
function getSlopeVaporPressureCurve(tempAvg: number): number {
  return 4098 * getSaturationVaporPressure(tempAvg) / Math.pow(tempAvg + 237.3, 2);
}
```

### getLatentHeatEvaporation

```typescript
function getLatentHeatEvaporation(tempAvg: number): number {
  return 2.501 - 2.361 * Math.pow(10, -3) * tempAvg;
}
```

### getPsychrometricConstant

```typescript
function getPsychrometricConstant(height: number, tempAverage: number): number {
  const p = 101.3 * Math.pow((293 - 0.0065 * height) / 293, 5.26);
  return p * (SPECIFIC_HEAT_AT_CONSTANT_PRESSURE_CONSTANT /
         (MOLECULAR_WEIGHT_RATIO_OF_WATER_VAPOR_DRY_AIR *
         getLatentHeatEvaporation(tempAverage)));
}
```

### getDegreesDay

```typescript
function getDegreesDay(
  tempMax: number,
  tempMin: number,
  cropBaseTemperature: number
): number {
  return tempMax + tempMin / 2 - cropBaseTemperature;
}
```

### Calculate (Main Climate Calculation)

```typescript
function calculateClimate(
  date: Date,
  measurementVariables: MeasurementVariable[],
  climateMeasurements: Measurement[],
  cropProduction: CropProductionEntity
): KPIsOutput {
  let tempMin = 0, tempMax = 0, tempAvg = 0;
  let humMin = 0, humMax = 0, humAvg = 0;
  let saturationVaporPressureAtMaxTemp = 0;
  let saturationVaporPressureAtMinTemp = 0;
  let saturationVaporPressureAtAvgTemp = 0;
  let realVaporPressureAtMaxRelativeHumidity = 0;
  let realVaporPressureAtMinRelativeHumidity = 0;
  let realVaporPressureAtAvgRelativeHumidity = 0;
  let vaporPressureDeficitAtMaxTemp = 0;
  let vaporPressureDeficitAtMimTemp = 0;
  let vaporPressureDeficitAtAvgTemp = 0;
  let extraTerrestrialRadiationAsEnergy = 0;
  let extraTerrestrialRadiationAsWater = 0;
  let incidentSolarRadiation = 0;
  let solarRadiationForAClearDay = 0;
  let netShortwaveSolarRadiation = 0;
  let netLongwaveSolarRadiation = 0;
  let netSolarRadiation = 0;
  let aerodynamicResistance = 0;
  let referenceCropSurfaceResistance = 0;
  let evapotranspirationRadiationTerm = 0;
  let aerodynamicEvapotranspirationRadiationTerm = 0;
  let evapotranspirationReferencePenmanMontiehtFAO56 = 0;
  let evapotranspirationReferenceHargreaves = 0;
  let relraIrsO = 0;
  let lightIntegralPAR = 0;
  let lightIntegralGlobal = 0;

  const output: KPIsOutput = {} as KPIsOutput;

  // Temperature measurements (MeasurementVariableStandardId == 5)
  const measurementVariable = measurementVariables.find(x => x.measurementVariableStandardId === 5);
  if (measurementVariable) {
    const tempMeasurements = climateMeasurements.filter(
      x => x.measurementVariableId === measurementVariable.id
    );

    if (tempMeasurements.length > 0) {
      tempMin = Math.min(...tempMeasurements.map(x => x.minValue));
      tempMax = Math.max(...tempMeasurements.map(x => x.maxValue));
      tempAvg = tempMeasurements.reduce((sum, x) => sum + x.avgValue, 0) / tempMeasurements.length;

      saturationVaporPressureAtMinTemp = getSaturationVaporPressure(tempMin);
      saturationVaporPressureAtMaxTemp = getSaturationVaporPressure(tempMax);
      saturationVaporPressureAtAvgTemp = getSaturationVaporPressure(tempAvg);

      output.saturationVaporPressureAtMinTemp = saturationVaporPressureAtMinTemp;
      output.saturationVaporPressureAtMaxTemp = saturationVaporPressureAtMaxTemp;
      output.saturationVaporPressureAtAvgTemp = saturationVaporPressureAtAvgTemp;
      output.tempMin = tempMin;
      output.tempMax = tempMax;
      output.tempAvg = tempAvg;
    }
  }

  // Humidity measurements (MeasurementVariableStandardId == 6)
  const humVariable = measurementVariables.find(x => x.measurementVariableStandardId === 6);
  if (humVariable) {
    const humMeasurements = climateMeasurements.filter(
      x => x.measurementVariableId === humVariable.id
    );

    if (humMeasurements.length > 0 && tempMeasurements.length > 0) {
      humMin = Math.min(...humMeasurements.map(x => x.minValue));
      humMax = Math.max(...humMeasurements.map(x => x.maxValue));
      humAvg = humMeasurements.reduce((sum, x) => sum + x.avgValue, 0) / humMeasurements.length;

      realVaporPressureAtMaxRelativeHumidity = saturationVaporPressureAtMinTemp * humMin / 100;
      realVaporPressureAtMinRelativeHumidity = saturationVaporPressureAtMaxTemp * humMax / 100;
      realVaporPressureAtAvgRelativeHumidity = saturationVaporPressureAtAvgTemp * humAvg / 100;

      vaporPressureDeficitAtMaxTemp = saturationVaporPressureAtMaxTemp - realVaporPressureAtMaxRelativeHumidity;
      vaporPressureDeficitAtMimTemp = saturationVaporPressureAtMinTemp - realVaporPressureAtMinRelativeHumidity;
      vaporPressureDeficitAtAvgTemp = saturationVaporPressureAtAvgTemp - realVaporPressureAtAvgRelativeHumidity;

      extraTerrestrialRadiationAsEnergy = SOLAR_CONSTANT * getEarthSunInverseDistance(date) *
        getExtraterrestrialSolarRadiationTerm(date, cropProduction.latitudeGrades, cropProduction.latitudeMinutes);

      incidentSolarRadiation = 0.178 * (tempMax - tempMin) * extraTerrestrialRadiationAsEnergy;
      solarRadiationForAClearDay = (0.75 + 2 * (cropProduction.altitude / 100000)) * extraTerrestrialRadiationAsEnergy;
      relraIrsO = incidentSolarRadiation / solarRadiationForAClearDay;
      netShortwaveSolarRadiation = (1 - ALBEDO_CONSTANT) * incidentSolarRadiation;
      netLongwaveSolarRadiation = getIsothermalLongwaveRadiationFactor(tempMax, tempMin) *
        getHumidityFactor(realVaporPressureAtAvgRelativeHumidity) * getCloudFactor(relraIrsO);
      netSolarRadiation = netShortwaveSolarRadiation - netLongwaveSolarRadiation;
      evapotranspirationRadiationTerm = getSlopeVaporPressureCurve(tempAvg) * netSolarRadiation /
        (getSlopeVaporPressureCurve(tempAvg) + getPsychrometricConstant(cropProduction.altitude, tempAvg) *
        (1 + referenceCropSurfaceResistance / aerodynamicResistance)) / getLatentHeatEvaporation(tempAvg);

      output.relativeHumidtyMin = humMin;
      output.relativeHumidtyMax = humMax;
      output.relativeHumidtyAvg = humAvg;
    }
  }

  // Wind speed measurements (MeasurementVariableStandardId == 8)
  const windVariable = measurementVariables.find(x => x.measurementVariableStandardId === 8);
  if (windVariable) {
    const windSpeedMeasurements = climateMeasurements.filter(
      x => x.measurementVariableId === windVariable.id
    );

    if (windSpeedMeasurements.length > 0) {
      const winSpeedAvg = windSpeedMeasurements.reduce((sum, x) => sum + x.avgValue, 0) /
        windSpeedMeasurements.length;
      output.windSpeed = winSpeedAvg;

      aerodynamicResistance = 208 / getWindSpeedAsMtsPerSecond(winSpeedAvg, cropProduction.windSpeedMeasurementHeight) / 86400;
      referenceCropSurfaceResistance = REFERENCE_CROP_SURFACE_RESISTANCE_CONSTANT / 86400;

      aerodynamicEvapotranspirationRadiationTerm = getPsychrometricConstant(cropProduction.altitude, tempAvg) /
        (getSlopeVaporPressureCurve(tempAvg) + getPsychrometricConstant(cropProduction.altitude, tempAvg) *
        (1 + referenceCropSurfaceResistance / aerodynamicResistance)) * (900.0 / (tempAvg + 273)) *
        getWindSpeedAsMtsPerSecond(winSpeedAvg, cropProduction.windSpeedMeasurementHeight) * vaporPressureDeficitAtAvgTemp;

      evapotranspirationReferencePenmanMontiehtFAO56 = evapotranspirationRadiationTerm +
        aerodynamicEvapotranspirationRadiationTerm;

      evapotranspirationReferenceHargreaves = 0.0023 * (tempAvg + 17.8) *
        Math.pow(tempMax - tempMin, 0.5) * extraTerrestrialRadiationAsWater;
    }
  }

  // PAR measurements (MeasurementVariableStandardId == 7)
  const parVariable = measurementVariables.find(x => x.measurementVariableStandardId === 7);
  if (parVariable) {
    const parMeasurements = climateMeasurements.filter(
      x => x.measurementVariableId === parVariable.id
    );

    if (parMeasurements.length > 0) {
      const radAvg = parMeasurements.reduce((sum, x) => sum + x.avgValue, 0) / parMeasurements.length;
      lightIntegralPAR = radAvg * 0.0036;
    }
  }

  // Global radiation measurements (MeasurementVariableStandardId == 4)
  const radVariable = measurementVariables.find(x => x.measurementVariableStandardId === 4);
  if (radVariable) {
    const radMeasurements = climateMeasurements.filter(
      x => x.measurementVariableId === radVariable.id
    );

    if (radMeasurements.length > 0) {
      const radAvg = radMeasurements.reduce((sum, x) => sum + x.avgValue, 0) / radMeasurements.length;
      lightIntegralGlobal = radAvg * 0.0036;
    }
  }

  // Populate output
  output.date = date;
  output.latitudeInGrades = cropProduction.latitudeGrades;
  output.latitudeInMinutes = cropProduction.latitudeMinutes;
  output.altitude = cropProduction.altitude;
  output.windSpeedMeasurementHeight = cropProduction.windSpeedMeasurementHeight;
  output.realVaporPressureAtMaxRelativeHumidity = realVaporPressureAtMaxRelativeHumidity;
  output.realVaporPressureAtMinRelativeHumidity = realVaporPressureAtMinRelativeHumidity;
  output.realVaporPressureAtAvgRelativeHumidity = realVaporPressureAtAvgRelativeHumidity;
  output.vaporPressureDeficitAtMaxTemp = vaporPressureDeficitAtMaxTemp;
  output.vaporPressureDeficitAtMimTemp = vaporPressureDeficitAtMimTemp;
  output.vaporPressureDeficitAtAvgTemp = vaporPressureDeficitAtAvgTemp;
  output.extraTerrestrialRadiationAsEnergy = extraTerrestrialRadiationAsEnergy;
  output.extraTerrestrialRadiationAsWater = extraTerrestrialRadiationAsWater;
  output.incidentSolarRadiation = incidentSolarRadiation;
  output.solarRadiationForAClearDay = solarRadiationForAClearDay;
  output.netShortwaveSolarRadiation = netShortwaveSolarRadiation;
  output.netLongwaveSolarRadiation = netLongwaveSolarRadiation;
  output.netSolarRadiation = netSolarRadiation;
  output.aerodynamicResistance = aerodynamicResistance;
  output.referenceCropSurfaceResistance = referenceCropSurfaceResistance;
  output.evapotranspirationRadiationTerm = evapotranspirationRadiationTerm;
  output.aerodynamicEvapotranspirationRadiationTerm = aerodynamicEvapotranspirationRadiationTerm;
  output.evapotranspirationReferencePenmanMontiehtFAO56 = evapotranspirationReferencePenmanMontiehtFAO56;
  output.evapotranspirationReferenceHargreaves = evapotranspirationReferenceHargreaves;
  output.lightIntegralPAR = lightIntegralPAR;
  output.lightIntegralGlobal = lightIntegralGlobal;

  return output;
}
```

---

## 4. CalculationsIrrigation.cs → CalculationsIrrigation.ts

### GetIrrigationMetrics

```typescript
function getIrrigationMetrics(
  dataModel: CalculationInput,
  date: Date
): IrrigationMetric[] | null {
  if (!dataModel.irrigationData) {
    return null;
  }

  const irrigationMetrics: IrrigationMetric[] = [];

  const startDate = new Date(date);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(date);
  endDate.setHours(23, 59, 59, 999);

  const irrigationEvents = dataModel.irrigationData
    .filter(x => x.dateTimeStart >= startDate && x.dateTimeEnd <= endDate)
    .sort((a, b) => a.dateTimeStart.getTime() - b.dateTimeStart.getTime());

  for (let i = 0; i < irrigationEvents.length; i++) {
    const inputs: IrrigationEventEntity[] = [irrigationEvents[i]];

    if (i > 0) {
      inputs.push(irrigationEvents[i - 1]);
    }

    const output = calculateIrrigationCalculationOutput(
      inputs,
      dataModel.cropProduction,
      dataModel.measurementVariables
    );
    irrigationMetrics.push(output);
  }

  return irrigationMetrics;
}
```

### CalculateIrrigationCalculationOutput

```typescript
function calculateIrrigationCalculationOutput(
  inputs: IrrigationEventEntity[],
  cropProduction: CropProductionEntity,
  measurementVariables: MeasurementVariable[]
): IrrigationMetric {
  const output: IrrigationMetric = {} as IrrigationMetric;

  output.date = inputs[0].recordDateTime;

  // Calculate interval if there's a previous event
  if (inputs.length > 1) {
    output.irrigationInterval = inputs[0].dateTimeStart.getTime() - inputs[1].dateTimeEnd.getTime();
  }

  // Calculate irrigation length
  output.irrigationLength = inputs[0].dateTimeEnd.getTime() - inputs[0].dateTimeStart.getTime();

  // Calculate densities
  const densityContainer = 1 / (cropProduction.betweenRowDistance * cropProduction.betweenContainerDistance);
  const densityPlant = 1 / (cropProduction.betweenRowDistance * cropProduction.betweenPlantDistance);

  // Get irrigation volume
  const irrigationVolumeVariable = measurementVariables.find(
    x => x.measurementVariableStandardId === 19
  );

  if (irrigationVolumeVariable) {
    const irrigationVolumen = inputs[0].irrigationMeasurements
      .filter(x => x.measurementVariableId === irrigationVolumeVariable.id)
      .reduce((sum, x) => sum + x.recordValue, 0);

    output.irrigationVolumenM2 = new VolumeClass(
      irrigationVolumen * densityContainer,
      VolumeMeasure.ToLitre
    );

    output.irrigationVolumenPerPlant = new VolumeClass(
      output.irrigationVolumenM2.getValue() / densityPlant,
      VolumeMeasure.ToLitre
    );

    output.irrigationVolumenTotal = new VolumeClass(
      cropProduction.area * output.irrigationVolumenM2.getValue(),
      VolumeMeasure.ToLitre
    );

    // Get drain volume
    const drainVolumeVariable = measurementVariables.find(
      x => x.measurementVariableStandardId === 20
    );

    if (drainVolumeVariable) {
      const drainVolumen = inputs[0].irrigationMeasurements
        .filter(x => x.measurementVariableId === drainVolumeVariable.id)
        .reduce((sum, x) => sum + x.recordValue, 0);

      output.drainVolumenM2 = new VolumeClass(
        drainVolumen * densityContainer,
        VolumeMeasure.ToLitre
      );

      output.drainVolumenPerPlant = new VolumeClass(
        output.drainVolumenM2.getValue() / densityPlant,
        VolumeMeasure.ToLitre
      );

      output.drainPercentage = output.drainVolumenM2.getValue() /
        output.irrigationVolumenM2.getValue() * 100;
    }

    // Calculate flow and precipitation
    const irrigationLengthHours = output.irrigationLength / (1000 * 60 * 60);

    output.irrigationFlow = new VolumeClass(
      irrigationVolumen / irrigationLengthHours,
      VolumeMeasure.ToLitre
    );

    output.irrigationPrecipitation = new VolumeClass(
      output.irrigationVolumenM2.getValue() / irrigationLengthHours,
      VolumeMeasure.None
    );
  }

  output.cropProductionId = inputs[0].cropProductionId;

  return output;
}
```

---

## 5. GlobalOutput.cs → GlobalOutput.ts

### getIrrigationIntervalStats

```typescript
function getIrrigationIntervalStats(
  irrigationMetrics: IrrigationMetric[],
  excludeFirst: boolean
): TimeSpanMetricStat | null {
  let metrics = irrigationMetrics;

  if (excludeFirst) {
    metrics = irrigationMetrics.slice(1);
  }

  if (!metrics || metrics.length === 0) {
    return null;
  }

  const intervals = metrics.map(x => x.irrigationInterval);

  const output: TimeSpanMetricStat = {
    min: Math.min(...intervals),
    max: Math.max(...intervals),
    average: intervals.reduce((sum, x) => sum + x, 0) / intervals.length,
    sum: intervals.reduce((sum, x) => sum + x, 0)
  };

  return output;
}
```

### getIrrigationLengthStats

```typescript
function getIrrigationLengthStats(
  irrigationMetrics: IrrigationMetric[]
): TimeSpanMetricStat | null {
  if (!irrigationMetrics || irrigationMetrics.length === 0) {
    return null;
  }

  const lengths = irrigationMetrics.map(x => x.irrigationLength);

  const output: TimeSpanMetricStat = {
    min: Math.min(...lengths),
    max: Math.max(...lengths),
    average: lengths.reduce((sum, x) => sum + x, 0) / lengths.length,
    sum: lengths.reduce((sum, x) => sum + x, 0)
  };

  return output;
}
```

### getIrrigationVolumenSum

```typescript
function getIrrigationVolumenSum(irrigationMetrics: IrrigationMetric[]): Volume {
  const sum = irrigationMetrics.reduce(
    (total, x) => total + x.irrigationVolumenM2.getValue(),
    0
  );
  return new VolumeClass(sum, VolumeMeasure.ToLitre);
}
```

### getIrrigationVolumenMin

```typescript
function getIrrigationVolumenMin(irrigationMetrics: IrrigationMetric[]): Volume {
  const min = Math.min(
    ...irrigationMetrics.map(x => x.irrigationVolumenM2.getValue())
  );
  return new VolumeClass(min, VolumeMeasure.ToLitre);
}
```

### getIrrigationVolumenMax

```typescript
function getIrrigationVolumenMax(irrigationMetrics: IrrigationMetric[]): Volume {
  const max = Math.max(
    ...irrigationMetrics.map(x => x.irrigationVolumenM2.getValue())
  );
  return new VolumeClass(max, VolumeMeasure.ToLitre);
}
```

### getIrrigationVolumenAvg

```typescript
function getIrrigationVolumenAvg(irrigationMetrics: IrrigationMetric[]): Volume {
  const avg = irrigationMetrics.reduce(
    (sum, x) => sum + x.irrigationVolumenM2.getValue(),
    0
  ) / irrigationMetrics.length;
  return new VolumeClass(avg, VolumeMeasure.ToLitre);
}
```

---

## 6. Calculations.cs → Calculations.ts

### Calculate (Main Calculation Orchestrator)

```typescript
function calculate(dataModel: CalculationInput): GlobalOutput[] {
  const globalOutput: GlobalOutput[] = [];
  const dates: Date[] = [];

  // Generate date range
  const currentDate = new Date(dataModel.startingDate);
  while (currentDate <= dataModel.endingDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  for (const date of dates) {
    const currentDateOutput: GlobalOutput = {
      date: date,
      cropProduction: dataModel.cropProduction,
      kpis: [],
      irrigationMetrics: []
    };

    // Get climate measurements for this date
    const climateMeasurementsList = dataModel.climateData
      .filter(x => isSameDay(x.recordDate, date))
      .sort((a, b) => a.recordDate.getTime() - b.recordDate.getTime());

    // Get irrigation metrics for this date
    const irrigationMetrics = getIrrigationMetrics(dataModel, date);

    // Get growing medium measurements for this date
    const growingMediumMetrics = dataModel.growingMediumData
      .filter(x => isSameDay(x.recordDate, date))
      .sort((a, b) => a.recordDate.getTime() - b.recordDate.getTime());

    currentDateOutput.irrigationMetrics = irrigationMetrics || [];

    const previousDateGrowingMediumData = growingMediumMetrics.sort(
      (a, b) => b.recordDate.getTime() - a.recordDate.getTime()
    );

    let currentTime = new Date(date);
    currentTime.setHours(-1, 0, 0, 0);

    const nHours = isSameDay(dataModel.startingDate, dataModel.endingDate)
      ? dataModel.endingDate.getHours()
      : 24;

    // Process each hour of the day
    for (let i = 1; i <= 24; i++) {
      currentTime.setHours(currentTime.getHours() + 1);

      let kpisOutput: KPIsOutput = {} as KPIsOutput;

      // Get climate measurements for this hour
      const climateMeasurements = dataModel.climateData.filter(
        x => x.recordDate.getTime() === currentTime.getTime()
      );

      if (climateMeasurements.length > 0) {
        kpisOutput = calculateClimate(
          date,
          dataModel.measurementVariables,
          climateMeasurements,
          dataModel.cropProduction
        );
      }

      // Find last irrigation event before current time
      const lastIrrigationEvent = dataModel.irrigationData
        .filter(x => x.dateTimeStart < currentTime)
        .sort((a, b) => a.dateTimeStart.getTime() - b.dateTimeStart.getTime())[0];

      // Get growing medium data up to current hour
      const prevDate = date;
      const currentHourEnd = new Date(date);
      currentHourEnd.setHours(i, 0, 0, 0);

      const currentDateGrowingMediumData = growingMediumMetrics.filter(
        x => x.recordDate >= prevDate && x.recordDate <= currentHourEnd
      );

      let prevWC: Measurement | null = null;

      if (i === 1 && previousDateGrowingMediumData.length > 0) {
        prevWC = previousDateGrowingMediumData[0];
      } else if (currentDateGrowingMediumData.length > 0) {
        prevWC = currentDateGrowingMediumData[0];
      }

      // Get irrigation metrics for current time window
      const irrigationMetricsCurrent = (irrigationMetrics || []).filter(
        x => x.date >= prevDate && x.date <= currentHourEnd
      );

      // Calculate evapotranspiration
      if (prevWC && currentDateGrowingMediumData.length > 0) {
        const irrigationVolume = irrigationMetricsCurrent.reduce(
          (sum, x) => sum + x.irrigationVolumenM2.getValue(),
          0
        );

        const drainVolume = irrigationMetricsCurrent.reduce(
          (sum, x) => sum + x.drainVolumenM2.getValue(),
          0
        );

        const previousVolumetricWaterContent = prevWC.avgValue;
        const currentVolumetricWaterContent = currentDateGrowingMediumData[0].avgValue;
        const deltaVolumetricWaterContent = previousVolumetricWaterContent -
          currentVolumetricWaterContent;

        const containerDensity = 1 / (dataModel.cropProduction.betweenContainerDistance *
          dataModel.cropProduction.betweenRowDistance);

        const containerMediumVolumen = dataModel.cropProduction.container.volume.getValue() *
          containerDensity;

        const cropEvapoTranspiration = irrigationVolume - drainVolume -
          containerMediumVolumen * (deltaVolumetricWaterContent / 100);

        kpisOutput.cropEvapoTranspiration = cropEvapoTranspiration;
      }

      currentDateOutput.kpis.push(kpisOutput);
    }

    globalOutput.push(currentDateOutput);
  }

  return globalOutput;
}

// Helper function
function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
}
```

---

## Usage Example

```typescript
// Example usage of the TypeScript calculation functions

const cropProduction: CropProductionEntity = {
  id: 1,
  betweenRowDistance: 1.5,
  betweenContainerDistance: 0.3,
  betweenPlantDistance: 0.15,
  area: 1000,
  container: {
    volume: new VolumeClass(5000, VolumeMeasure.ToLitre)
  },
  latitudeGrades: 40,
  latitudeMinutes: 30,
  altitude: 100,
  windSpeedMeasurementHeight: 2
};

const calculationInput: CalculationInput = {
  startingDate: new Date('2024-01-01'),
  endingDate: new Date('2024-01-31'),
  cropProduction: cropProduction,
  measurementVariables: [],
  climateData: [],
  growingMediumData: [],
  irrigationData: []
};

// Run calculations
const results = calculate(calculationInput);

console.log('Calculation results:', results);
```
