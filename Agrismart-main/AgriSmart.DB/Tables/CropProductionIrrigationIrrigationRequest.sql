CREATE TABLE [dbo].[CropProductionIrrigationIrrigationRequest]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CropProductionId] INT NOT NULL,
	[Irrigate] BIT NOT NULL DEFAULT 1, 
	[IrrigationTime] INT NOT NULL,
	[DateStarted] DATETIME NULL,
	[DateEnded] DATETIME NULL,
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
	CONSTRAINT [FK_CropProductionIrrigationIrrigationRequest_CropProduction] FOREIGN KEY ([CropProductionId]) REFERENCES [CropProduction]([Id])
)
