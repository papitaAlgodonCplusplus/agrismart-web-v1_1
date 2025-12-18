# Nutrient Recipe Missing Fields Analysis

## Executive Summary

The nutrient formulation feature displays soil-specific and fertigation parameters that are NOT currently being saved to the database. This analysis identifies all missing fields and provides a complete solution.

## Current Situation

### Fields Being Displayed (from UI inspection)

**System Configuration:**
1. **System Type** (formulationMode): "Hidroponía / Sustrato" OR "Suelo / Fertirriego"
2. **Soil Analysis ID**: Reference to selected soil analysis (e.g., "11 de noviembre de 2028")

**Fertigation Parameters** (only for Soil/Fertirriego mode):
3. **Volume per Application**: 1000 L
4. **Applications per Week**: 3
5. **Leaching Fraction**: 20%
6. **Root Depth**: 40 cm

**Water Source:**
7. **Water Source ID**: Currently set to `null` but should save the selected water source (e.g., "Fuente #3")

**Results Summary:**
8. **Status Message**: "Formulación Requiere Ajustes"
9. **Summary Line**: Full nutrient balance summary text
10. **Percentage Achieved** for each nutrient: e.g., N: 0%, P: 0%, K: 164%

### Fields Currently in Database (from Entity)

✅ **Already Saved:**
- Name, Description
- CropId, CropPhaseId, WaterSourceId (but set to null!), CatalogId
- TargetPh, TargetEc, VolumeLiters
- TargetNitrogen, TargetPhosphorus, TargetPotassium, TargetCalcium, TargetMagnesium, TargetSulfur, TargetIron
- AchievedNitrogen, AchievedPhosphorus, AchievedPotassium, AchievedCalcium, AchievedMagnesium, AchievedSulfur, AchievedIron
- TotalCost, CostPerLiter
- RecipeType, Instructions (JSON), Warnings (JSON), Notes
- Fertilizers (separate table)

❌ **Missing from Database:**
1. **SoilAnalysisId** (int?, nullable) - Links to SoilAnalysis table
2. **FormulationMode** (string) - "Hydroponics" or "Soil"
3. **FertigationVolumePerApplication** (double?, nullable) - Liters per application
4. **FertigationApplicationsPerWeek** (int?, nullable) - Frequency of applications
5. **FertigationLeachingFraction** (double?, nullable) - Percentage (0-100)
6. **FertigationRootDepth** (double?, nullable) - Centimeters
7. **PercentageNitrogen** (double?, nullable) - Achievement percentage
8. **PercentagePhosphorus** (double?, nullable) - Achievement percentage
9. **PercentagePotassium** (double?, nullable) - Achievement percentage
10. **PercentageCalcium** (double?, nullable) - Achievement percentage
11. **PercentageMagnesium** (double?, nullable) - Achievement percentage
12. **StatusMessage** (string?, nullable) - Result status text
13. **SummaryLine** (string?, nullable) - One-line summary of results

## Impact

### Data Loss
- **Soil formulations** cannot be properly saved or recreated
- **Fertigation parameters** are lost after save
- **Water source selection** is not persisted (set to null)
- **Achievement percentages** are calculated but not saved
- **Status and summary** information is lost

### User Experience
- Users must re-enter all soil/fertigation parameters when loading a saved recipe
- Cannot compare or audit soil-based formulations
- No historical record of formulation outcomes (status, percentages)

## Required Changes

### 1. Database Migration (SQL)

```sql
-- Add missing fields to NutrientFormulationRecipe table
ALTER TABLE NutrientFormulationRecipe
ADD SoilAnalysisId INT NULL,
    FormulationMode NVARCHAR(50) NULL,
    FertigationVolumePerApplication FLOAT NULL,
    FertigationApplicationsPerWeek INT NULL,
    FertigationLeachingFraction FLOAT NULL,
    FertigationRootDepth FLOAT NULL,
    PercentageNitrogen FLOAT NULL,
    PercentagePhosphorus FLOAT NULL,
    PercentagePotassium FLOAT NULL,
    PercentageCalcium FLOAT NULL,
    PercentageMagnesium FLOAT NULL,
    StatusMessage NVARCHAR(500) NULL,
    SummaryLine NVARCHAR(1000) NULL;

-- Add foreign key constraint for SoilAnalysisId
ALTER TABLE NutrientFormulationRecipe
ADD CONSTRAINT FK_NutrientFormulationRecipe_SoilAnalysis
FOREIGN KEY (SoilAnalysisId) REFERENCES SoilAnalysis(Id);
```

### 2. C# Entity Updates

**File:** `AgriSmart.Core\Entities\NutrientFormulationRecipe.cs`

Add properties after line 58:

```csharp
// Soil/Fertigation Specific Parameters
public int? SoilAnalysisId { get; set; }
public string? FormulationMode { get; set; } // "Hydroponics" or "Soil"
public double? FertigationVolumePerApplication { get; set; }
public int? FertigationApplicationsPerWeek { get; set; }
public double? FertigationLeachingFraction { get; set; }
public double? FertigationRootDepth { get; set; }

// Achievement Percentages
public double? PercentageNitrogen { get; set; }
public double? PercentagePhosphorus { get; set; }
public double? PercentagePotassium { get; set; }
public double? PercentageCalcium { get; set; }
public double? PercentageMagnesium { get; set; }

// Result Summary
public string? StatusMessage { get; set; }
public string? SummaryLine { get; set; }
```

### 3. Command/DTO Updates

**File:** `AgriSmart.Application.Agronomic\Commands\CreateNutrientRecipeCommand.cs`

Add properties after line 42:

```csharp
// Soil/Fertigation Parameters
public int? SoilAnalysisId { get; set; }
public string? FormulationMode { get; set; }
public double? FertigationVolumePerApplication { get; set; }
public int? FertigationApplicationsPerWeek { get; set; }
public double? FertigationLeachingFraction { get; set; }
public double? FertigationRootDepth { get; set; }

// Achievement Percentages
public double? PercentageNitrogen { get; set; }
public double? PercentagePhosphorus { get; set; }
public double? PercentagePotassium { get; set; }
public double? PercentageCalcium { get; set; }
public double? PercentageMagnesium { get; set; }

// Result Summary
public string? StatusMessage { get; set; }
public string? SummaryLine { get; set; }
```

**File:** `AgriSmart.Application.Agronomic\Commands\UpdateNutrientRecipeCommand.cs`

Same properties need to be added.

### 4. Response DTO Updates

**File:** `AgriSmart.Application.Agronomic\Responses\Queries\GetAllNutrientRecipesResponse.cs`

Add to the recipe DTO:

```csharp
public int? SoilAnalysisId { get; set; }
public string? FormulationMode { get; set; }
public double? FertigationVolumePerApplication { get; set; }
public int? FertigationApplicationsPerWeek { get; set; }
public double? FertigationLeachingFraction { get; set; }
public double? FertigationRootDepth { get; set; }
public double? PercentageNitrogen { get; set; }
public double? PercentagePhosphorus { get; set; }
public double? PercentagePotassium { get; set; }
public double? PercentageCalcium { get; set; }
public double? PercentageMagnesium { get; set; }
public string? StatusMessage { get; set; }
public string? SummaryLine { get; set; }
```

### 5. Angular Component Updates

**File:** `src\app\features\nutrient-formulation\nutrient-formulation.component.ts`

Update `saveRecipe` method (around line 1190) to include:

```typescript
const command = {
    // ... existing fields ...
    waterSourceId: this.formulationForm.get('waterSourceId')?.value || null, // FIX: Don't set to null!

    // Add new fields
    soilAnalysisId: this.selectedSoilAnalysis?.id || null,
    formulationMode: this.formulationMode, // 'hydroponics' or 'soil'
    fertigationVolumePerApplication: this.formulationMode === 'soil' ? this.soilIrrigationVolume : null,
    fertigationApplicationsPerWeek: this.formulationMode === 'soil' ? this.soilIrrigationsPerWeek : null,
    fertigationLeachingFraction: this.formulationMode === 'soil' ? this.soilLeachingFraction : null,
    fertigationRootDepth: this.formulationMode === 'soil' ? this.soilRootingDepth : null,

    // Add percentages
    percentageNitrogen: result.nutrientBalance?.nitrogen?.ratio ? result.nutrientBalance.nitrogen.ratio * 100 : null,
    percentagePhosphorus: result.nutrientBalance?.phosphorus?.ratio ? result.nutrientBalance.phosphorus.ratio * 100 : null,
    percentagePotassium: result.nutrientBalance?.potassium?.ratio ? result.nutrientBalance.potassium.ratio * 100 : null,
    percentageCalcium: result.nutrientBalance?.calcium?.ratio ? result.nutrientBalance.calcium.ratio * 100 : null,
    percentageMagnesium: result.nutrientBalance?.magnesium?.ratio ? result.nutrientBalance.magnesium.ratio * 100 : null,

    // Add summary
    statusMessage: this.getFormulationStatus(result),
    summaryLine: this.getSimpleFormulationSummary(),

    // ... rest of fields ...
};
```

### 6. Handler Updates

**File:** `AgriSmart.Application.Agronomic\Handlers\Commands\CreateNutrientRecipeHandler.cs`

Update mapping to include new fields when creating the entity from command.

**File:** `AgriSmart.Application.Agronomic\Handlers\Queries\GetNutrientRecipeByIdHandler.cs`

Update mapping to include new fields when returning the response.

## Testing Checklist

After implementing all changes:

1. ✅ Save a Hydroponic formulation - verify all basic fields are saved
2. ✅ Save a Soil/Fertigation formulation - verify all soil-specific fields are saved
3. ✅ Load a saved Hydroponic recipe - verify it displays exactly as when first calculated
4. ✅ Load a saved Soil recipe - verify all fertigation parameters are restored
5. ✅ Verify Water Source is correctly saved and loaded
6. ✅ Verify percentages are saved and displayed
7. ✅ Verify status message and summary line are saved and displayed
8. ✅ Test PUT endpoint - verify updates work correctly
9. ✅ Test GET endpoint - verify all fields are returned
10. ✅ Take screenshots comparing before-save and after-load states

## Files to Modify

### Backend (C#)
1. `AgriSmart.Core\Entities\NutrientFormulationRecipe.cs` - Add properties
2. `AgriSmart.Application.Agronomic\Commands\CreateNutrientRecipeCommand.cs` - Add properties
3. `AgriSmart.Application.Agronomic\Commands\UpdateNutrientRecipeCommand.cs` - Add properties
4. `AgriSmart.Application.Agronomic\Responses\Queries\GetAllNutrientRecipesResponse.cs` - Add to DTO
5. `AgriSmart.Application.Agronomic\Responses\Queries\GetNutrientRecipeByIdResponse.cs` - Add to DTO
6. `AgriSmart.Application.Agronomic\Handlers\Commands\CreateNutrientRecipeHandler.cs` - Update mapping
7. `AgriSmart.Application.Agronomic\Handlers\Commands\UpdateNutrientRecipeHandler.cs` - Update mapping
8. `AgriSmart.Application.Agronomic\Handlers\Queries\GetAllNutrientRecipesHandler.cs` - Update mapping
9. `AgriSmart.Application.Agronomic\Handlers\Queries\GetNutrientRecipeByIdHandler.cs` - Update mapping

### Frontend (Angular)
10. `src\app\features\nutrient-formulation\nutrient-formulation.component.ts` - Update save/load methods
11. Test the complete flow with screenshots

### Database
12. Run SQL migration script

## Priority

**HIGH PRIORITY** - This is blocking users from:
- Properly saving soil-based formulations
- Accurately recreating saved recipes
- Auditing and comparing historical formulations

## Estimated Effort

- SQL Migration: 5 minutes
- Backend Changes: 30-45 minutes
- Frontend Changes: 15-20 minutes
- Testing: 20-30 minutes
- **Total: ~1.5-2 hours**
