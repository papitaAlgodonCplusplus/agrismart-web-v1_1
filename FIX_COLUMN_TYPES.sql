-- =============================================
-- SQL Migration: Fix Column Type Mismatches
-- Convert DECIMAL columns to FLOAT to match C# double types
-- Date: 2025-12-18
-- =============================================

USE AgriSmartDB;
GO

PRINT 'Fixing column type mismatches...';

-- Fix Additional Nutrient columns (should be FLOAT not DECIMAL)
IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetChloride')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ALTER COLUMN TargetChloride FLOAT NULL;
    PRINT 'Fixed TargetChloride to FLOAT';
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedChloride')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ALTER COLUMN AchievedChloride FLOAT NULL;
    PRINT 'Fixed AchievedChloride to FLOAT';
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetSodium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ALTER COLUMN TargetSodium FLOAT NULL;
    PRINT 'Fixed TargetSodium to FLOAT';
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedSodium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ALTER COLUMN AchievedSodium FLOAT NULL;
    PRINT 'Fixed AchievedSodium to FLOAT';
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetAmmonium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ALTER COLUMN TargetAmmonium FLOAT NULL;
    PRINT 'Fixed TargetAmmonium to FLOAT';
END
GO

IF EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedAmmonium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ALTER COLUMN AchievedAmmonium FLOAT NULL;
    PRINT 'Fixed AchievedAmmonium to FLOAT';
END
GO

-- Verify the changes
PRINT 'Verifying column types...';
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    NUMERIC_PRECISION,
    NUMERIC_SCALE
FROM
    INFORMATION_SCHEMA.COLUMNS
WHERE
    TABLE_NAME = 'NutrientFormulationRecipe'
    AND COLUMN_NAME IN (
        'TargetChloride', 'AchievedChloride',
        'TargetSodium', 'AchievedSodium',
        'TargetAmmonium', 'AchievedAmmonium',
        'ApiPriceCoveragePercent', 'CostPerM3Crc'
    )
ORDER BY COLUMN_NAME;

PRINT 'Type fixes completed successfully!';
GO
