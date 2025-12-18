-- =============================================
-- SQL Migration: Add Advanced Recipe Fields
-- Purpose: Store complete advanced formulation calculation data
-- Date: 2025-12-18
-- =============================================

USE AgriSmartDB;
GO

-- Step 1: Add columns for storing complete calculation data
-- Note: RecipeType already exists to distinguish Simple vs Advanced
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CalculationDataUsedJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD CalculationDataUsedJson NVARCHAR(MAX) NULL;
    PRINT 'Added CalculationDataUsedJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'IntegrationMetadataJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD IntegrationMetadataJson NVARCHAR(MAX) NULL;
    PRINT 'Added IntegrationMetadataJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'OptimizationSummaryJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD OptimizationSummaryJson NVARCHAR(MAX) NULL;
    PRINT 'Added OptimizationSummaryJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PerformanceMetricsJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PerformanceMetricsJson NVARCHAR(MAX) NULL;
    PRINT 'Added PerformanceMetricsJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CostAnalysisJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD CostAnalysisJson NVARCHAR(MAX) NULL;
    PRINT 'Added CostAnalysisJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'NutrientDiagnosticsJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD NutrientDiagnosticsJson NVARCHAR(MAX) NULL;
    PRINT 'Added NutrientDiagnosticsJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'LinearProgrammingAnalysisJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD LinearProgrammingAnalysisJson NVARCHAR(MAX) NULL;
    PRINT 'Added LinearProgrammingAnalysisJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'DataSourcesJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD DataSourcesJson NVARCHAR(MAX) NULL;
    PRINT 'Added DataSourcesJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertilizerDosagesJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD FertilizerDosagesJson NVARCHAR(MAX) NULL;
    PRINT 'Added FertilizerDosagesJson column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'VerificationResultsJson')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD VerificationResultsJson NVARCHAR(MAX) NULL;
    PRINT 'Added VerificationResultsJson column';
END
GO

-- Step 2: Add specific important fields for quick access/filtering
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'LinearProgrammingEnabled')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD LinearProgrammingEnabled BIT NULL;
    PRINT 'Added LinearProgrammingEnabled column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'ActiveFertilizerCount')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD ActiveFertilizerCount INT NULL;
    PRINT 'Added ActiveFertilizerCount column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CalculationTimestamp')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD CalculationTimestamp DATETIME NULL;
    PRINT 'Added CalculationTimestamp column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CatalogIdUsed')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD CatalogIdUsed INT NULL;
    PRINT 'Added CatalogIdUsed column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PhaseIdUsed')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PhaseIdUsed INT NULL;
    PRINT 'Added PhaseIdUsed column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'WaterIdUsed')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD WaterIdUsed INT NULL;
    PRINT 'Added WaterIdUsed column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'UserIdUsed')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD UserIdUsed INT NULL;
    PRINT 'Added UserIdUsed column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'ApiPriceCoveragePercent')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD ApiPriceCoveragePercent DECIMAL(5,2) NULL;
    PRINT 'Added ApiPriceCoveragePercent column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CostPerM3Crc')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD CostPerM3Crc DECIMAL(18,2) NULL;
    PRINT 'Added CostPerM3Crc column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertilizersAnalyzed')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD FertilizersAnalyzed INT NULL;
    PRINT 'Added FertilizersAnalyzed column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'SafetyCapsApplied')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD SafetyCapsApplied BIT NULL;
    PRINT 'Added SafetyCapsApplied column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'StrictCapsMode')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD StrictCapsMode BIT NULL;
    PRINT 'Added StrictCapsMode column';
END
GO

-- Step 3: Add achieved micronutrient columns that may be missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetChloride')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD TargetChloride DECIMAL(18,2) NULL;
    PRINT 'Added TargetChloride column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedChloride')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD AchievedChloride DECIMAL(18,2) NULL;
    PRINT 'Added AchievedChloride column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetSodium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD TargetSodium DECIMAL(18,2) NULL;
    PRINT 'Added TargetSodium column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedSodium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD AchievedSodium DECIMAL(18,2) NULL;
    PRINT 'Added AchievedSodium column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetAmmonium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD TargetAmmonium DECIMAL(18,2) NULL;
    PRINT 'Added TargetAmmonium column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedAmmonium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD AchievedAmmonium DECIMAL(18,2) NULL;
    PRINT 'Added AchievedAmmonium column';
END
GO

-- Step 4: Add PDF report fields
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PdfReportFilename')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PdfReportFilename NVARCHAR(500) NULL;
    PRINT 'Added PdfReportFilename column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PdfReportGenerated')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PdfReportGenerated BIT NULL;
    PRINT 'Added PdfReportGenerated column';
END
GO

-- Step 5: Verify the changes
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
        'RecipeType',
        'CalculationResultsJson',
        'CalculationDataUsedJson',
        'IntegrationMetadataJson',
        'OptimizationSummaryJson',
        'PerformanceMetricsJson',
        'CostAnalysisJson',
        'NutrientDiagnosticsJson',
        'LinearProgrammingAnalysisJson',
        'DataSourcesJson',
        'FertilizerDosagesJson',
        'VerificationResultsJson',
        'LinearProgrammingEnabled',
        'ActiveFertilizerCount',
        'CalculationTimestamp',
        'ApiPriceCoveragePercent',
        'CostPerM3Crc',
        'PdfReportFilename',
        'PdfReportGenerated'
    )
ORDER BY COLUMN_NAME;

PRINT 'Migration completed successfully!';
GO
