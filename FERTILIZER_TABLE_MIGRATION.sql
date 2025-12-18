-- =============================================
-- Migration: Add missing columns to NutrientFormulationRecipeFertilizer table
-- Date: 2025-12-17
-- Description: Ensures all entity properties exist in the database
-- =============================================

USE AgriSmart;
GO

PRINT 'Starting NutrientFormulationRecipeFertilizer table migration...';
GO

-- Check if table exists, create if not
IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[NutrientFormulationRecipeFertilizer] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [RecipeId] INT NOT NULL,
        [FertilizerId] INT NOT NULL,
        [DateCreated] DATETIME2 NULL,
        [DateUpdated] DATETIME2 NULL,
        [CreatedBy] INT NULL,
        [UpdatedBy] INT NULL
    );
    PRINT 'Created NutrientFormulationRecipeFertilizer table';
END
GO

-- Add BaseEntity columns if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'DateCreated')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD DateCreated DATETIME2 NULL;
    PRINT 'Added DateCreated column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'DateUpdated')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD DateUpdated DATETIME2 NULL;
    PRINT 'Added DateUpdated column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'CreatedBy')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD CreatedBy INT NULL;
    PRINT 'Added CreatedBy column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'UpdatedBy')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD UpdatedBy INT NULL;
    PRINT 'Added UpdatedBy column';
END
GO

-- Add core relationship columns if missing
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'RecipeId')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD RecipeId INT NOT NULL DEFAULT 0;
    PRINT 'Added RecipeId column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'FertilizerId')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD FertilizerId INT NOT NULL DEFAULT 0;
    PRINT 'Added FertilizerId column';
END
GO

-- Add dosage columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'ConcentrationGramsPerLiter')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD ConcentrationGramsPerLiter FLOAT NOT NULL DEFAULT 0;
    PRINT 'Added ConcentrationGramsPerLiter column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'TotalGrams')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD TotalGrams FLOAT NULL;
    PRINT 'Added TotalGrams column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'TotalKilograms')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD TotalKilograms FLOAT NULL;
    PRINT 'Added TotalKilograms column';
END
GO

-- Add nutrient contribution columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'NitrogenContribution')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD NitrogenContribution FLOAT NULL;
    PRINT 'Added NitrogenContribution column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'PhosphorusContribution')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD PhosphorusContribution FLOAT NULL;
    PRINT 'Added PhosphorusContribution column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'PotassiumContribution')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD PotassiumContribution FLOAT NULL;
    PRINT 'Added PotassiumContribution column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'CalciumContribution')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD CalciumContribution FLOAT NULL;
    PRINT 'Added CalciumContribution column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'MagnesiumContribution')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD MagnesiumContribution FLOAT NULL;
    PRINT 'Added MagnesiumContribution column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'SulfurContribution')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD SulfurContribution FLOAT NULL;
    PRINT 'Added SulfurContribution column';
END
GO

-- Add percentage columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'PercentageOfN')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD PercentageOfN FLOAT NULL;
    PRINT 'Added PercentageOfN column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'PercentageOfP')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD PercentageOfP FLOAT NULL;
    PRINT 'Added PercentageOfP column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'PercentageOfK')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD PercentageOfK FLOAT NULL;
    PRINT 'Added PercentageOfK column';
END
GO

-- Add cost columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'CostPerUnit')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD CostPerUnit DECIMAL(18,2) NULL;
    PRINT 'Added CostPerUnit column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'TotalCost')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD TotalCost DECIMAL(18,2) NULL;
    PRINT 'Added TotalCost column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'CostPortion')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD CostPortion DECIMAL(18,2) NULL;
    PRINT 'Added CostPortion column';
END
GO

-- Add application columns
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'ApplicationOrder')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD ApplicationOrder INT NULL;
    PRINT 'Added ApplicationOrder column';
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'ApplicationNotes')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD ApplicationNotes NVARCHAR(4000) NULL;
    PRINT 'Added ApplicationNotes column';
END
GO

-- Add status column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]') AND name = 'Active')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer] ADD Active BIT NULL;
    PRINT 'Added Active column';
END
GO

PRINT 'NutrientFormulationRecipeFertilizer table migration completed successfully!';
PRINT 'Please restart the backend service to apply changes.';
GO
