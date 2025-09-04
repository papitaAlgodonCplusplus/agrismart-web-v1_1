CREATE TABLE [dbo].[Farm]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CompanyId] INT NOT NULL,
	[Name] NVARCHAR(64) NOT NULL,
	[Description] NVARCHAR(128) NULL,
	[Polygon] GEOMETRY NULL,
    [TimeZoneId] INT NOT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
    CONSTRAINT [FK_Farm_ToCompany] FOREIGN KEY ([CompanyId]) REFERENCES [Company]([Id])
)