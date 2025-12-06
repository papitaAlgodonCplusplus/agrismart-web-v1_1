-- Migration: Add additional fields to ProductionUnit table
-- Date: 2024-12-06
-- Description: Adds fields for soil type, drainage, greenhouse type, ventilation, lighting, irrigation, and climate control

USE [AgriSmartDB]
GO

-- Check if columns exist before adding them to avoid errors
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'SoilType')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [SoilType] NVARCHAR(100) NULL
    PRINT 'Added column: SoilType'
END
ELSE
BEGIN
    PRINT 'Column already exists: SoilType'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'Drainage')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [Drainage] NVARCHAR(50) NULL
    PRINT 'Added column: Drainage'
END
ELSE
BEGIN
    PRINT 'Column already exists: Drainage'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'GreenhouseType')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [GreenhouseType] NVARCHAR(100) NULL
    PRINT 'Added column: GreenhouseType'
END
ELSE
BEGIN
    PRINT 'Column already exists: GreenhouseType'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'Ventilation')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [Ventilation] NVARCHAR(100) NULL
    PRINT 'Added column: Ventilation'
END
ELSE
BEGIN
    PRINT 'Column already exists: Ventilation'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'LightingSystem')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [LightingSystem] NVARCHAR(100) NULL
    PRINT 'Added column: LightingSystem'
END
ELSE
BEGIN
    PRINT 'Column already exists: LightingSystem'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'Irrigation')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [Irrigation] BIT NOT NULL DEFAULT 0
    PRINT 'Added column: Irrigation'
END
ELSE
BEGIN
    PRINT 'Column already exists: Irrigation'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'ClimateControl')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [ClimateControl] BIT NOT NULL DEFAULT 0
    PRINT 'Added column: ClimateControl'
END
ELSE
BEGIN
    PRINT 'Column already exists: ClimateControl'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'Location')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [Location] NVARCHAR(200) NULL
    PRINT 'Added column: Location'
END
ELSE
BEGIN
    PRINT 'Column already exists: Location'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'Area')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [Area] DECIMAL(18,2) NULL
    PRINT 'Added column: Area'
END
ELSE
BEGIN
    PRINT 'Column already exists: Area'
END
GO

IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID(N'[dbo].[ProductionUnit]') AND name = 'Capacity')
BEGIN
    ALTER TABLE [dbo].[ProductionUnit]
    ADD [Capacity] INT NULL
    PRINT 'Added column: Capacity'
END
ELSE
BEGIN
    PRINT 'Column already exists: Capacity'
END
GO

-- Verify the changes
SELECT
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'ProductionUnit'
ORDER BY ORDINAL_POSITION
GO

PRINT 'Migration completed successfully!'
GO
