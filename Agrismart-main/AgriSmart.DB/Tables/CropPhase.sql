CREATE TABLE [dbo].[CropPhase]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CropId] INT NOT NULL,
	[CatalogId] INT NOT NULL DEFAULT -1,
	[Name] NVARCHAR(32) NULL,
	[Description] NVARCHAR(128) NULL,
	[Sequence] INT NULL,
	[StartingWeek] INT NULL,
	[EndingWeek] INT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
	CONSTRAINT [FK_CropPhase_ToCatalog] FOREIGN KEY ([CatalogId]) REFERENCES [Catalog]([Id])
)