CREATE TABLE [dbo].[RelayModuleCropProductionIrrigationSector]
(
	[RelayModuleId] INT NOT NULL,
	[CropProductionIrrigationSectorId] INT NOT NULL,
	[Active] BIT NOT NULL DEFAULT 1,
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
	CONSTRAINT [FK_RelayModuleCropProductionIrrigationSector_RelayModule] FOREIGN KEY ([RelayModuleId]) REFERENCES [RelayModule]([Id]),
	CONSTRAINT [RelayModuleCropProductionIrrigationSector_CropProductionIrrigationSector] FOREIGN KEY ([CropProductionIrrigationSectorId]) REFERENCES [CropProductionIrrigationSector]([Id]), 
    CONSTRAINT [PK_RelayModuleCropProductionIrrigationSector] PRIMARY KEY ([RelayModuleId], [CropProductionIrrigationSectorId])
)