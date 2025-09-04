CREATE TABLE [dbo].[Container]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CatalogId] INT NOT NULL,
	[Name] NVARCHAR(32) NOT NULL,
	[ContainerTypeId]  INT NOT NULL,
	[Height] FLOAT NOT NULL,
	[Width] FLOAT NOT NULL,
	[Length] FLOAT NOT NULL, 
	[LowerDiameter] FLOAT NOT NULL,
	[UpperDiameter] FLOAT NOT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
	CONSTRAINT [FK_Container_ToCatalog] FOREIGN KEY ([CatalogId]) REFERENCES [Catalog]([Id])
)
