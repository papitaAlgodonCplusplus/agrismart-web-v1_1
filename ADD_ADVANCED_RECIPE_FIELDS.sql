-- =============================================
-- Add Advanced Calculator Fields to NutrientFormulationRecipes Table
-- =============================================

USE AgriSmartDb;
GO

-- Add Advanced Calculator Specific Fields
ALTER TABLE NutrientFormulationRecipes
ADD OptimizationMethod NVARCHAR(50) NULL,
    OptimizationStatus NVARCHAR(50) NULL,
    TotalDosageGramsPerLiter FLOAT NULL,
    SolverTimeSeconds FLOAT NULL,
    IonicBalanceError FLOAT NULL,
    AverageDeviationPercent FLOAT NULL,
    SuccessRatePercent FLOAT NULL,
    CalculationResultsJson NVARCHAR(MAX) NULL;
GO

PRINT 'Successfully added advanced calculator fields to NutrientFormulationRecipes table';
GO

-- Verify the columns were added
SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'NutrientFormulationRecipes'
AND COLUMN_NAME IN (
    'OptimizationMethod',
    'OptimizationStatus',
    'TotalDosageGramsPerLiter',
    'SolverTimeSeconds',
    'IonicBalanceError',
    'AverageDeviationPercent',
    'SuccessRatePercent',
    'CalculationResultsJson'
)
ORDER BY ORDINAL_POSITION;
GO
