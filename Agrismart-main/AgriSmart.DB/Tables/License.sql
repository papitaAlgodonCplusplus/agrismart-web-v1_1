CREATE TABLE [dbo].[License]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[ClientId] INT NOT NULL,
	[Key] NVARCHAR(64) NOT NULL,
	[ExpirationDate] DATETIME NOT NULL,
	[AllowedCompanies] INT NOT NULL,
	[AllowedFarms] INT NOT NULL,
	[AllowedUsers] INT NOT NULL,
	[AllowedProductionUnits] INT NOT NULL,
	[AllowedCropProductions] INT NOT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
