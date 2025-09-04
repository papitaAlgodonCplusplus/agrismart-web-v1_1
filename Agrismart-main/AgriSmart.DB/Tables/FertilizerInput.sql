CREATE TABLE dbo.FertilizerInput(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CatalogId] INT NOT NULL,
	[InputPresentationId] INT NOT NULL,
	[FertilizerId] INT NOT NULL,
	[Name] NVARCHAR(64) NULL,
	[Price] DECIMAL(8, 2) NULL,
	[Active] BIT NOT NULL DEFAULT 1,	
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL)