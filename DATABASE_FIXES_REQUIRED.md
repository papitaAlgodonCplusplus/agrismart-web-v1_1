# Database Fixes Required

This document lists critical database fixes needed based on KPI_DEBUG_ANALYSIS.md findings.

## Issue #4: Crop Base Temperature (CRITICAL)

**Problem:** Crop base temperature is set to 78°C, which would kill plants.
**Root Cause:** Value likely entered in Fahrenheit instead of Celsius.
**Expected Value:** 78°F = 25.6°C (reasonable for crop base temperature)

### SQL Fix:

```sql
-- Update crop base temperature from Fahrenheit to Celsius
UPDATE Crop
SET cropBaseTemperature = 25.6  -- Converted from 78°F
WHERE id = 26;

-- Verify the change
SELECT id, cropName, cropBaseTemperature FROM Crop WHERE id = 26;
```

### Reference Values:
- Corn: 10°C
- Tomato: 10°C
- Strawberry: 5°C
- Cotton: 15°C
- Typical range: 5-25°C

---

## Issue #6: Latitude Coordinate (HIGH PRIORITY)

**Problem:** Latitude is set to 89°, which is near the North/South Pole.
**Root Cause:** Data entry error.
**Expected Value:** ~10° N (Costa Rica location)

### SQL Fix:

```sql
-- Update crop production coordinates to Costa Rica
UPDATE CropProduction
SET latitude = 10.0,   -- Approximate Costa Rica latitude
    longitude = -84.0  -- Approximate Costa Rica longitude
WHERE id = 1;

-- Verify the change
SELECT id, latitude, longitude FROM CropProduction WHERE id = 1;
```

### Impact:
This fix will correct:
- Solar radiation calculations
- Day length calculations
- All ET (evapotranspiration) calculations
- Sunrise/sunset angle calculations

---

## Optional: Add Database Constraints

To prevent future data entry errors, consider adding validation constraints:

```sql
-- Add constraint for crop base temperature (must be 0-35°C)
ALTER TABLE Crop
ADD CONSTRAINT chk_cropBaseTemperature
CHECK (cropBaseTemperature BETWEEN 0 AND 35);

-- Add constraint for latitude (must be within agricultural zones)
ALTER TABLE CropProduction
ADD CONSTRAINT chk_latitude
CHECK (latitude BETWEEN -66.5 AND 66.5); -- Arctic/Antarctic circles

-- Add constraint for longitude
ALTER TABLE CropProduction
ADD CONSTRAINT chk_longitude
CHECK (longitude BETWEEN -180 AND 180);
```

---

## Optional: Add Unit Metadata

Consider adding unit fields to make the data self-documenting:

```sql
-- Add temperature unit field to Crop table
ALTER TABLE Crop
ADD COLUMN temperatureUnit VARCHAR(5) DEFAULT 'C';

-- Add distance unit field to CropProductionSpecs
ALTER TABLE CropProductionSpecs
ADD COLUMN distanceUnit VARCHAR(10) DEFAULT 'cm';

-- Add constraint to ensure valid units
ALTER TABLE Crop
ADD CONSTRAINT chk_temperatureUnit
CHECK (temperatureUnit IN ('C', 'F'));

ALTER TABLE CropProductionSpecs
ADD CONSTRAINT chk_distanceUnit
CHECK (distanceUnit IN ('cm', 'm', 'mm'));
```

---

## Verification Checklist

After applying database fixes, verify:

- [ ] Crop base temperature is between 5-25°C
- [ ] Latitude is between 9-11° for Costa Rica
- [ ] Longitude is around -84° for Costa Rica
- [ ] All KPI calculations show reasonable values:
  - VPD: 0.5-2.5 kPa
  - ET Reference: 2-8 mm/day
  - Degrees Day: 5-30 °C·día per day
  - Total Plants: >1000 for large areas

---

## Notes

These fixes address data entry errors identified in the KPI_DEBUG_ANALYSIS.md report. The code has been updated with validation to prevent similar issues in the future, but the database values must be corrected manually.
