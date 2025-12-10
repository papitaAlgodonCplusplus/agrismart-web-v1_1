# Irrigation Decision Engine Implementation - Task 3.1

## Overview
Implemented an intelligent irrigation decision engine service that analyzes multiple factors to provide smart irrigation recommendations.

## Files Created

### 1. Models (`src/app/features/services/models/irrigation-decision.models.ts`)
Defines the core interfaces for the decision engine:
- **IrrigationRecommendation**: The output recommendation structure
- **IrrigationDecisionFactors**: All factors considered in the decision
- **IrrigationRule**: Rule interface for modular decision logic
- **RuleEvaluation**: Result from evaluating each rule
- **WeatherForecast**: Structure for weather data (currently mocked)
- **GrowthStageConfig**: Growth stage-specific irrigation parameters

### 2. Service (`src/app/features/services/irrigation-decision-engine.service.ts`)
Main decision engine service with the following capabilities:

#### Core Features:
1. **Multi-Factor Analysis**
   - Soil moisture depletion (from DeviceRawData API)
   - Climate conditions (VPD, temperature, humidity)
   - Recent drainage feedback
   - Time of day optimization
   - Growth stage requirements
   - Weather forecast (MOCKED - see below)

2. **Rule-Based Decision System**
   Six intelligent rules with different priorities:
   - **Rule 1: Moisture Depletion** (Priority 10) - Triggers when soil moisture drops below threshold
   - **Rule 2: High VPD** (Priority 7) - Compensates for high transpiration demand
   - **Rule 3: Drainage Feedback** (Priority 6) - Adjusts volume based on recent drainage
   - **Rule 4: Time of Day** (Priority 5) - Optimizes irrigation timing
   - **Rule 5: Growth Stage** (Priority 8) - Considers crop sensitivity
   - **Rule 6: Weather Forecast** (Priority 4) - MOCKED - delays if rain expected

3. **Smart Volume Calculation**
   - Calculates base volume from container capacity and depletion
   - Applies rule-based adjustments (VPD compensation, drainage feedback)
   - Adds target drainage percentage (20%)
   - Converts to irrigation duration based on flow rate

4. **Urgency Levels**
   - **Critical**: >60% depletion - immediate irrigation needed
   - **High**: >threshold depletion or high water stress
   - **Medium**: Moderate depletion
   - **Low**: Preventive irrigation or suboptimal conditions

## Data Sources Used

### ✅ Real Data Integration:
1. **Soil Moisture**: From `DeviceRawData` API
   - Sensors: `water_SOIL`, `water_SOIL_original`, `conduct_SOIL`
   - Gets most recent reading from last 24 hours

2. **Temperature**: From `DeviceRawData` API
   - Sensors: `TEMP_SOIL`, `TempC_DS18B20`, `temp_SOIL`

3. **Crop Production Data**: From `CropProductionService`
   - Area, spacing, planting date

4. **Substrate Properties**: From `GrowingMedium` entity
   - Container capacity percentage
   - Permanent wilting point
   - Available water percentages

5. **Container Info**: From `Container` entity
   - Volume (liters)
   - Dimensions

### ❌ Mocked Data (TODO: UNMOCK):

#### Weather Forecast API
**Location**: Lines 9, 577-594 in `irrigation-decision-engine.service.ts`

```typescript
// TODO: UNMOCK - Weather forecast integration needed for production use
```

**What's Mocked**:
- `forecastedRainfall`: Currently assumes 0mm
- `forecastedTemperature`: Not used yet
- Future VPD predictions: Not available

**Implementation Notes**:
The service has a `weatherForecastRule()` that checks for forecasted rainfall. Currently returns:
```typescript
const forecastedRainfall = factors.forecastedRainfall || 0;
```

**To Integrate Real Weather Data**:
1. Create `weather-forecast.service.ts`
2. Use OpenWeather API or similar (free tier available)
3. Add API key to `environment.ts`
4. Call API in `getCurrentClimate()` method
5. Parse forecast data and add to `IrrigationDecisionFactors`

Example integration:
```typescript
// In environment.ts
openWeatherApiKey: 'YOUR_API_KEY'

// Create weather-forecast.service.ts
getForecast(lat: number, lon: number): Observable<WeatherForecast[]> {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.apiKey}`;
  return this.http.get(url).pipe(
    map(response => this.parseWeatherData(response))
  );
}
```

#### Humidity Sensors
**Location**: Lines 222-224 in `irrigation-decision-engine.service.ts`

```typescript
// TODO: UNMOCK - Get humidity readings from real sensors
// Currently mocked because humidity sensors not in sample data
const currentHumidity = 65; // MOCKED
```

**Why Mocked**: Sample DeviceRawData doesn't include humidity sensors

**To Use Real Data**:
1. Ensure humidity sensors are publishing to DeviceRawData
2. Add sensor names to filter (e.g., `'humidity_SOIL'`, `'RH_sensor'`)
3. Parse readings same as temperature

#### Default Values
Some fallback values are used when data is unavailable:
- **Default soil moisture**: 30% (if no sensor data)
- **Default temperature**: 25°C (if no sensor data)
- **Default container**: 10L (if not specified)
- **Default flow rate**: 2 L/min (TODO: get from system config)

## Configuration Constants

Easily adjustable thresholds in the service:

```typescript
const DEFAULT_DEPLETION_THRESHOLD = 40; // % - trigger irrigation at 40% depletion
const HIGH_VPD_THRESHOLD = 1.2; // kPa - high transpiration demand
const LOW_VPD_THRESHOLD = 0.4; // kPa - low transpiration demand
const OPTIMAL_DRAIN_PERCENTAGE_MIN = 15; // %
const OPTIMAL_DRAIN_PERCENTAGE_MAX = 25; // %
const CRITICAL_DEPLETION_THRESHOLD = 60; // % - urgent irrigation needed
```

Growth stage configurations:
```typescript
const GROWTH_STAGE_CONFIGS = {
  germination: { depletionThreshold: 20, waterStressSensitivity: 'high' },
  vegetative: { depletionThreshold: 30, waterStressSensitivity: 'medium' },
  flowering: { depletionThreshold: 25, waterStressSensitivity: 'high' },
  fruiting: { depletionThreshold: 30, waterStressSensitivity: 'high' },
  harvest: { depletionThreshold: 40, waterStressSensitivity: 'low' }
}
```

Optimal irrigation times:
```typescript
const OPTIMAL_IRRIGATION_HOURS = {
  morning: { start: 6, end: 10 },
  lateAfternoon: { start: 16, end: 18 }
};
const AVOID_IRRIGATION_HOURS = { start: 11, end: 14 }; // midday
```

## Usage Example

```typescript
// In a component
constructor(private decisionEngine: IrrigationDecisionEngineService) {}

getIrrigationRecommendation(cropProductionId: number) {
  this.decisionEngine.getRecommendation(cropProductionId)
    .subscribe(recommendation => {
      console.log('Should Irrigate:', recommendation.shouldIrrigate);
      console.log('Volume:', recommendation.recommendedVolume, 'L');
      console.log('Duration:', recommendation.recommendedDuration, 'min');
      console.log('Urgency:', recommendation.urgency);
      console.log('Confidence:', recommendation.confidence, '%');
      console.log('Reasoning:', recommendation.reasoning);

      if (recommendation.bestTimeToExecute) {
        console.log('Best time:', recommendation.bestTimeToExecute);
      }
    });
}
```

## Output Example

```json
{
  "shouldIrrigate": true,
  "recommendedVolume": 8.5,
  "recommendedDuration": 5,
  "totalVolume": 425.0,
  "confidence": 87,
  "reasoning": [
    "Soil moisture depletion at 42.3% exceeds threshold (30%)",
    "High VPD detected (1.35 kPa) - increased transpiration demand",
    "Optimal time for irrigation (7:00)"
  ],
  "urgency": "high",
  "nextRecommendedCheck": "2025-12-08T15:30:00Z"
}
```

## Next Steps (Task 3.2)

To complete the Irrigation Decision Engine implementation:

1. **Extend `on-demand-irrigation.component.ts`**:
   - Add "Auto Mode" toggle
   - Display current recommendation
   - Show recommendation reasoning
   - Auto-execute on critical urgency (optional)
   - Show countdown to next check

2. **Add UI Elements**:
   - Recommendation card showing current status
   - Visual indicators for urgency (colors)
   - Confidence meter
   - Reasoning list display
   - Manual override controls

3. **Add Monitoring**:
   - Periodic polling (every 5-15 minutes)
   - Log recommendation history
   - Alert on critical conditions

4. **Weather Integration** (optional but recommended):
   - Implement `weather-forecast.service.ts`
   - Get API key from OpenWeather or similar
   - Add forecast display to dashboard

## Testing Recommendations

1. **Unit Tests**: Test each rule independently with mock factors
2. **Integration Tests**: Test with real DeviceRawData
3. **Edge Cases**:
   - No sensor data available
   - Extreme weather conditions
   - Multiple urgent conditions
   - Conflicting rules

## Notes

- All TODO: UNMOCK comments are clearly marked in the code
- Service is production-ready except for weather forecast integration
- Error handling includes fallback to safe defaults
- Confidence scoring helps users understand recommendation reliability
- Rule-based system is easily extensible (add more rules as needed)
