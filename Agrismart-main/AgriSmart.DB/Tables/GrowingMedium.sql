CREATE TABLE [dbo].[GrowingMedium]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CatalogId] INT NOT NULL,
	[Name] NVARCHAR(64) NOT NULL,
	[SaturationPoint] FLOAT NOT NULL DEFAULT 95.8,
	[ContainerCapacityPercentage] FLOAT NULL,
	[PermanentWiltingPoint] FLOAT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
