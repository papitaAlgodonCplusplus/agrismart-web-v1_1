-- ========================================================================
-- COMPLETE MIGRATION: Add ALL Missing Fields to NutrientFormulationRecipe
-- ========================================================================
-- This script adds all 46 missing columns to the NutrientFormulationRecipe table
-- Run this in SQL Server Management Studio or Azure Data Studio
-- ========================================================================

USE [AgriSmartDB];
GO

-- Core Fields (Basic recipe configuration)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'WaterSourceId')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD WaterSourceId INT NULL;
    PRINT 'Added WaterSourceId column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CatalogId')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD CatalogId INT NULL;
    PRINT 'Added CatalogId column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetPh')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetPh FLOAT NULL;
    PRINT 'Added TargetPh column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetEc')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetEc FLOAT NULL;
    PRINT 'Added TargetEc column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'VolumeLiters')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD VolumeLiters FLOAT NULL;
    PRINT 'Added VolumeLiters column';
END

-- Target Nutrient Levels
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetNitrogen')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetNitrogen FLOAT NULL;
    PRINT 'Added TargetNitrogen column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetPhosphorus')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetPhosphorus FLOAT NULL;
    PRINT 'Added TargetPhosphorus column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetPotassium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetPotassium FLOAT NULL;
    PRINT 'Added TargetPotassium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetCalcium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetCalcium FLOAT NULL;
    PRINT 'Added TargetCalcium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetMagnesium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetMagnesium FLOAT NULL;
    PRINT 'Added TargetMagnesium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetSulfur')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetSulfur FLOAT NULL;
    PRINT 'Added TargetSulfur column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetIron')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetIron FLOAT NULL;
    PRINT 'Added TargetIron column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetBoron')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetBoron FLOAT NULL;
    PRINT 'Added TargetBoron column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetCopper')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetCopper FLOAT NULL;
    PRINT 'Added TargetCopper column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetManganese')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetManganese FLOAT NULL;
    PRINT 'Added TargetManganese column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetMolybdenum')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetMolybdenum FLOAT NULL;
    PRINT 'Added TargetMolybdenum column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TargetZinc')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TargetZinc FLOAT NULL;
    PRINT 'Added TargetZinc column';
END

-- Achieved Nutrient Levels
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedNitrogen')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedNitrogen FLOAT NULL;
    PRINT 'Added AchievedNitrogen column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedPhosphorus')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedPhosphorus FLOAT NULL;
    PRINT 'Added AchievedPhosphorus column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedPotassium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedPotassium FLOAT NULL;
    PRINT 'Added AchievedPotassium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedCalcium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedCalcium FLOAT NULL;
    PRINT 'Added AchievedCalcium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedMagnesium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedMagnesium FLOAT NULL;
    PRINT 'Added AchievedMagnesium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedSulfur')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedSulfur FLOAT NULL;
    PRINT 'Added AchievedSulfur column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedIron')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedIron FLOAT NULL;
    PRINT 'Added AchievedIron column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedBoron')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedBoron FLOAT NULL;
    PRINT 'Added AchievedBoron column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedCopper')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedCopper FLOAT NULL;
    PRINT 'Added AchievedCopper column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedManganese')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedManganese FLOAT NULL;
    PRINT 'Added AchievedManganese column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedMolybdenum')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedMolybdenum FLOAT NULL;
    PRINT 'Added AchievedMolybdenum column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'AchievedZinc')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD AchievedZinc FLOAT NULL;
    PRINT 'Added AchievedZinc column';
END

-- Cost Fields
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'TotalCost')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD TotalCost DECIMAL(18,2) NULL;
    PRINT 'Added TotalCost column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'CostPerLiter')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD CostPerLiter DECIMAL(18,2) NULL;
    PRINT 'Added CostPerLiter column';
END

-- Text Fields
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'Instructions')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD Instructions NVARCHAR(MAX) NULL;
    PRINT 'Added Instructions column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'Warnings')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD Warnings NVARCHAR(MAX) NULL;
    PRINT 'Added Warnings column';
END

-- Soil/Fertigation Specific Parameters (13 fields)
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'SoilAnalysisId')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD SoilAnalysisId INT NULL;
    PRINT 'Added SoilAnalysisId column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FormulationMode')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD FormulationMode NVARCHAR(50) NULL;
    PRINT 'Added FormulationMode column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationVolumePerApplication')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD FertigationVolumePerApplication FLOAT NULL;
    PRINT 'Added FertigationVolumePerApplication column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationApplicationsPerWeek')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD FertigationApplicationsPerWeek INT NULL;
    PRINT 'Added FertigationApplicationsPerWeek column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationLeachingFraction')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD FertigationLeachingFraction FLOAT NULL;
    PRINT 'Added FertigationLeachingFraction column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationRootDepth')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD FertigationRootDepth FLOAT NULL;
    PRINT 'Added FertigationRootDepth column';
END

-- Achievement Percentages
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentageNitrogen')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD PercentageNitrogen FLOAT NULL;
    PRINT 'Added PercentageNitrogen column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentagePhosphorus')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD PercentagePhosphorus FLOAT NULL;
    PRINT 'Added PercentagePhosphorus column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentagePotassium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD PercentagePotassium FLOAT NULL;
    PRINT 'Added PercentagePotassium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentageCalcium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD PercentageCalcium FLOAT NULL;
    PRINT 'Added PercentageCalcium column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentageMagnesium')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD PercentageMagnesium FLOAT NULL;
    PRINT 'Added PercentageMagnesium column';
END

-- Result Summary Fields
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'StatusMessage')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD StatusMessage NVARCHAR(255) NULL;
    PRINT 'Added StatusMessage column';
END

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'SummaryLine')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipe] ADD SummaryLine NVARCHAR(MAX) NULL;
    PRINT 'Added SummaryLine column';
END

-- Add Foreign Key Constraint for SoilAnalysisId (if SoilAnalysis table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SoilAnalysis')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_NutrientFormulationRecipe_SoilAnalysis')
    BEGIN
        ALTER TABLE [dbo].[NutrientFormulationRecipe]
        ADD CONSTRAINT FK_NutrientFormulationRecipe_SoilAnalysis
        FOREIGN KEY (SoilAnalysisId) REFERENCES [dbo].[SoilAnalysis](Id)
        ON DELETE SET NULL;
        PRINT 'Added FK_NutrientFormulationRecipe_SoilAnalysis foreign key';
    END
END

PRINT '========================================================================';
PRINT 'Migration completed successfully!';
PRINT 'Added all 46 missing columns to NutrientFormulationRecipe table';
PRINT '========================================================================';
GO
