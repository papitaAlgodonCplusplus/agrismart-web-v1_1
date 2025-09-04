CREATE TABLE [dbo].[CalculationSettings]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,	
	[CatalogId] INT NOT NULL,
	[Name] NVARCHAR(64) NOT NULL,	
	[Value] FLOAT NOT NULL,	
	[IsMeasurementVariable] BIT NOT NULL DEFAULT 0,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
	CONSTRAINT [FK_CalculationSetting_ToCatalog] FOREIGN KEY ([CatalogId]) REFERENCES [Catalog]([Id])
)