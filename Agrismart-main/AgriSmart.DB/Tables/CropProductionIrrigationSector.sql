CREATE TABLE [dbo].[CropProductionIrrigationSector]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CropProductionId] INT NOT NULL,
	[Name] NVARCHAR(64) NOT NULL,
	[Polygon] GEOMETRY NULL, 
	[PumpRelayId] INT NULL,
	[ValveRelayId] INT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
    CONSTRAINT [FK_ProductionUnitSection_CropProduction] FOREIGN KEY ([CropProductionId]) REFERENCES [CropProduction]([Id])
)
