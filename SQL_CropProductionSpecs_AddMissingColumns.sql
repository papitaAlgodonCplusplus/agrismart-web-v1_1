-- Add missing audit columns to CropProductionSpecs table
USE [AgriSmart]
GO

-- Add DateCreated column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CropProductionSpecs]') AND name = 'DateCreated')
BEGIN
    ALTER TABLE [dbo].[CropProductionSpecs]
    ADD [DateCreated] DATETIME NULL;
    
    -- Set default value for existing rows
    UPDATE [dbo].[CropProductionSpecs]
    SET [DateCreated] = GETUTCDATE()
    WHERE [DateCreated] IS NULL;
END
GO

-- Add DateUpdated column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CropProductionSpecs]') AND name = 'DateUpdated')
BEGIN
    ALTER TABLE [dbo].[CropProductionSpecs]
    ADD [DateUpdated] DATETIME NULL;
END
GO

-- Add UpdatedBy column if it doesn't exist
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[CropProductionSpecs]') AND name = 'UpdatedBy')
BEGIN
    ALTER TABLE [dbo].[CropProductionSpecs]
    ADD [UpdatedBy] INT NULL;
END
GO

PRINT 'Missing columns added successfully to CropProductionSpecs table!'
GO
