-- =============================================
-- SQL Migration: Add Missing Advanced Calculator Fields
-- These fields were in the entity but missing from database
-- Date: 2025-12-18
-- =============================================

USE AgriSmartDB;
GO

-- Add columns that were in entity but missing from previous migration
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'OptimizationMethod')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD OptimizationMethod NVARCHAR(128) NULL;
    PRINT 'Added OptimizationMethod column';
END
ELSE
BEGIN
    PRINT 'OptimizationMethod column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'OptimizationStatus')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD OptimizationStatus NVARCHAR(128) NULL;
    PRINT 'Added OptimizationStatus column';
END
ELSE
BEGIN
    PRINT 'OptimizationStatus column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TotalDosageGramsPerLiter')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD TotalDosageGramsPerLiter FLOAT NULL;
    PRINT 'Added TotalDosageGramsPerLiter column';
END
ELSE
BEGIN
    PRINT 'TotalDosageGramsPerLiter column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'SolverTimeSeconds')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD SolverTimeSeconds FLOAT NULL;
    PRINT 'Added SolverTimeSeconds column';
END
ELSE
BEGIN
    PRINT 'SolverTimeSeconds column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'IonicBalanceError')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD IonicBalanceError FLOAT NULL;
    PRINT 'Added IonicBalanceError column';
END
ELSE
BEGIN
    PRINT 'IonicBalanceError column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AverageDeviationPercent')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD AverageDeviationPercent FLOAT NULL;
    PRINT 'Added AverageDeviationPercent column';
END
ELSE
BEGIN
    PRINT 'AverageDeviationPercent column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'SuccessRatePercent')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD SuccessRatePercent FLOAT NULL;
    PRINT 'Added SuccessRatePercent column';
END
ELSE
BEGIN
    PRINT 'SuccessRatePercent column already exists';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CalculationResultsJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD CalculationResultsJson NVARCHAR(MAX) NULL;
    PRINT 'Added CalculationResultsJson column';
END
ELSE
BEGIN
    PRINT 'CalculationResultsJson column already exists';
END
GO

-- Verify all required columns exist
PRINT 'Verifying columns...';
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_NAME = 'NutrientFormulationRecipe'
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
ORDER BY COLUMN_NAME;

PRINT 'Migration completed successfully!';
GO
