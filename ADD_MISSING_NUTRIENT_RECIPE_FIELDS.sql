-- =============================================
-- SQL Migration: Add Missing Fields to NutrientFormulationRecipe
-- Date: 2025-12-17
-- Description: Adds soil/fertigation parameters, achievement percentages,
--              and result summary fields to NutrientFormulationRecipe table
-- =============================================

USE [AgriSmartDB]; -- Replace with your actual database name
GO

-- Check if columns already exist before adding them
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'SoilAnalysisId')
BEGIN
    PRINT 'Adding SoilAnalysisId column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD SoilAnalysisId INT NULL;
END
ELSE
BEGIN
    PRINT 'SoilAnalysisId column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FormulationMode')
BEGIN
    PRINT 'Adding FormulationMode column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD FormulationMode NVARCHAR(50) NULL;
END
ELSE
BEGIN
    PRINT 'FormulationMode column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationVolumePerApplication')
BEGIN
    PRINT 'Adding FertigationVolumePerApplication column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD FertigationVolumePerApplication FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'FertigationVolumePerApplication column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationApplicationsPerWeek')
BEGIN
    PRINT 'Adding FertigationApplicationsPerWeek column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD FertigationApplicationsPerWeek INT NULL;
END
ELSE
BEGIN
    PRINT 'FertigationApplicationsPerWeek column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationLeachingFraction')
BEGIN
    PRINT 'Adding FertigationLeachingFraction column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD FertigationLeachingFraction FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'FertigationLeachingFraction column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'FertigationRootDepth')
BEGIN
    PRINT 'Adding FertigationRootDepth column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD FertigationRootDepth FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'FertigationRootDepth column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentageNitrogen')
BEGIN
    PRINT 'Adding PercentageNitrogen column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PercentageNitrogen FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'PercentageNitrogen column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentagePhosphorus')
BEGIN
    PRINT 'Adding PercentagePhosphorus column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PercentagePhosphorus FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'PercentagePhosphorus column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentagePotassium')
BEGIN
    PRINT 'Adding PercentagePotassium column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PercentagePotassium FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'PercentagePotassium column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentageCalcium')
BEGIN
    PRINT 'Adding PercentageCalcium column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PercentageCalcium FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'PercentageCalcium column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'PercentageMagnesium')
BEGIN
    PRINT 'Adding PercentageMagnesium column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD PercentageMagnesium FLOAT NULL;
END
ELSE
BEGIN
    PRINT 'PercentageMagnesium column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'StatusMessage')
BEGIN
    PRINT 'Adding StatusMessage column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD StatusMessage NVARCHAR(500) NULL;
END
ELSE
BEGIN
    PRINT 'StatusMessage column already exists, skipping...';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipe]') AND name = 'SummaryLine')
BEGIN
    PRINT 'Adding SummaryLine column...';
    ALTER TABLE [dbo].[NutrientFormulationRecipe]
    ADD SummaryLine NVARCHAR(1000) NULL;
END
ELSE
BEGIN
    PRINT 'SummaryLine column already exists, skipping...';
END
GO

-- Add foreign key constraint for SoilAnalysisId (if SoilAnalysis table exists)
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SoilAnalysis')
BEGIN
    IF NOT EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_NutrientFormulationRecipe_SoilAnalysis')
    BEGIN
        PRINT 'Adding foreign key constraint FK_NutrientFormulationRecipe_SoilAnalysis...';
        ALTER TABLE [dbo].[NutrientFormulationRecipe]
        ADD CONSTRAINT FK_NutrientFormulationRecipe_SoilAnalysis
        FOREIGN KEY (SoilAnalysisId) REFERENCES [dbo].[SoilAnalysis](Id)
        ON DELETE SET NULL; -- If soil analysis is deleted, set to NULL instead of cascading
    END
    ELSE
    BEGIN
        PRINT 'Foreign key constraint already exists, skipping...';
    END
END
ELSE
BEGIN
    PRINT 'SoilAnalysis table does not exist, skipping foreign key creation...';
END
GO

PRINT '==================================================';
PRINT 'Migration completed successfully!';
PRINT 'Added fields:';
PRINT '  - SoilAnalysisId (INT NULL)';
PRINT '  - FormulationMode (NVARCHAR(50) NULL)';
PRINT '  - FertigationVolumePerApplication (FLOAT NULL)';
PRINT '  - FertigationApplicationsPerWeek (INT NULL)';
PRINT '  - FertigationLeachingFraction (FLOAT NULL)';
PRINT '  - FertigationRootDepth (FLOAT NULL)';
PRINT '  - PercentageNitrogen (FLOAT NULL)';
PRINT '  - PercentagePhosphorus (FLOAT NULL)';
PRINT '  - PercentagePotassium (FLOAT NULL)';
PRINT '  - PercentageCalcium (FLOAT NULL)';
PRINT '  - PercentageMagnesium (FLOAT NULL)';
PRINT '  - StatusMessage (NVARCHAR(500) NULL)';
PRINT '  - SummaryLine (NVARCHAR(1000) NULL)';
PRINT '==================================================';
GO
