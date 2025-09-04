CREATE TABLE [dbo].[GraphSeries]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[GraphId] INT NOT NULL,
	[MeasurementVariableId] INT NOT NULL,
	[SeriesFeatures] XML NOT NUll,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
