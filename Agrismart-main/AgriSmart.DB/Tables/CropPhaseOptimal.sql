CREATE TABLE [dbo].[CropPhaseOptimal]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,	
	[CatalogId] INT NOT NULL DEFAULT -1,
	[Name] NVARCHAR(32) NULL,
	[Description] NVARCHAR(128) NULL,
	[Value] FLOAT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
	CONSTRAINT [FK_CropPhaseOptimal_ToCatalog] FOREIGN KEY ([CatalogId]) REFERENCES [Catalog]([Id])
)