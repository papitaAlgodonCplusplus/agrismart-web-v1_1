CREATE TABLE [dbo].[InputPresentation]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CatalogId] INT NOT NULL,
	[MeasurementUnitId] INT NULL,
	[Name] NVARCHAR(64) NULL,
	[Description] NVARCHAR(128) NULL,	
	[Quantity] FLOAT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
) 