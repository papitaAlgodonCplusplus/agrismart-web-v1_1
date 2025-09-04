CREATE TABLE [dbo].[FertilizerChemistry]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[FertilizerId] INT NOT NULL,
	[Purity] FLOAT NULL,
	[Density] FLOAT NULL,
	[Solubility0] FLOAT NULL,
	[Solubility20] FLOAT NULL,
	[Solubility40] FLOAT NULL,
	[Formula] NVARCHAR(64) NULL,
	[Valence] INT NOT NULL,
	[IsPhAdjuster] BIT NOT NULL DEFAULT 0, 
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
