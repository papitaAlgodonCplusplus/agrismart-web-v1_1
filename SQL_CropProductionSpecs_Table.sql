-- =============================================
-- Table: CropProductionSpecs
-- Description: Stores crop production specifications including container spacing, area, and water availability
-- =============================================

CREATE TABLE [dbo].[CropProductionSpecs]
(
    [Id] INT IDENTITY(1,1) NOT NULL,
    [Name] NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(500) NULL,

    -- Spacing specifications (in meters)
    [BetweenRowDistance] DECIMAL(10, 3) NOT NULL DEFAULT 2.0,
    [BetweenContainerDistance] DECIMAL(10, 3) NOT NULL DEFAULT 0.5,
    [BetweenPlantDistance] DECIMAL(10, 3) NOT NULL DEFAULT 0.25,

    -- Area specification (in square meters)
    [Area] DECIMAL(10, 2) NOT NULL DEFAULT 1000.0,

    -- Container specifications
    [ContainerVolume] DECIMAL(10, 2) NOT NULL DEFAULT 10.0,
    [AvailableWaterPercentage] DECIMAL(5, 2) NOT NULL DEFAULT 50.0,

    -- Audit fields
    [CreatedBy] INT NULL,
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [ModifiedBy] INT NULL,
    [ModifiedAt] DATETIME2(7) NULL,
    [DeletedBy] INT NULL,
    [DeletedAt] DATETIME2(7) NULL,
    [Active] BIT NOT NULL DEFAULT 1,

    -- Primary Key
    CONSTRAINT [PK_CropProductionSpecs] PRIMARY KEY CLUSTERED ([Id] ASC),

    -- Foreign Key to User table for audit
    CONSTRAINT [FK_CropProductionSpecs_User_CreatedBy] FOREIGN KEY([CreatedBy])
        REFERENCES [dbo].[User] ([Id]),
    CONSTRAINT [FK_CropProductionSpecs_User_ModifiedBy] FOREIGN KEY([ModifiedBy])
        REFERENCES [dbo].[User] ([Id]),
    CONSTRAINT [FK_CropProductionSpecs_User_DeletedBy] FOREIGN KEY([DeletedBy])
        REFERENCES [dbo].[User] ([Id]),

    -- Check Constraints
    CONSTRAINT [CHK_CropProductionSpecs_BetweenRowDistance] CHECK ([BetweenRowDistance] > 0),
    CONSTRAINT [CHK_CropProductionSpecs_BetweenContainerDistance] CHECK ([BetweenContainerDistance] > 0),
    CONSTRAINT [CHK_CropProductionSpecs_BetweenPlantDistance] CHECK ([BetweenPlantDistance] > 0),
    CONSTRAINT [CHK_CropProductionSpecs_Area] CHECK ([Area] > 0),
    CONSTRAINT [CHK_CropProductionSpecs_ContainerVolume] CHECK ([ContainerVolume] > 0),
    CONSTRAINT [CHK_CropProductionSpecs_AvailableWaterPercentage] CHECK ([AvailableWaterPercentage] >= 0 AND [AvailableWaterPercentage] <= 100)
);
GO

-- Create indexes for better query performance
CREATE NONCLUSTERED INDEX [IX_CropProductionSpecs_Active]
    ON [dbo].[CropProductionSpecs]([Active] ASC);
GO

CREATE NONCLUSTERED INDEX [IX_CropProductionSpecs_CreatedBy]
    ON [dbo].[CropProductionSpecs]([CreatedBy] ASC);
GO

-- Insert sample data
INSERT INTO [dbo].[CropProductionSpecs]
    ([Name], [Description], [BetweenRowDistance], [BetweenContainerDistance], [BetweenPlantDistance],
     [Area], [ContainerVolume], [AvailableWaterPercentage], [Active])
VALUES
    ('Default Configuration', 'Standard crop production spacing configuration', 2.0, 0.5, 0.25, 1000.0, 10.0, 50.0, 1),
    ('High Density Configuration', 'High density planting configuration', 1.5, 0.3, 0.2, 500.0, 5.0, 45.0, 1),
    ('Low Density Configuration', 'Low density planting configuration with larger spacing', 2.5, 0.7, 0.3, 2000.0, 15.0, 60.0, 1);
GO

PRINT 'CropProductionSpecs table created successfully!';
