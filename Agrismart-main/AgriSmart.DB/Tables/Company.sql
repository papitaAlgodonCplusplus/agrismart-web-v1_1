CREATE TABLE [dbo].[Company]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[ClientId] INT NOT NULL,
	[CatalogId] INT NOT NULL,
	[Name] NVARCHAR(64),
	[Description] NVARCHAR(128), 
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
    CONSTRAINT [FK_Company_ToClient] FOREIGN KEY ([ClientId]) REFERENCES [Client]([Id])
)