CREATE TABLE [dbo].[MeasurementUnit]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [Name] NVARCHAR(50) NOT NULL,
	[Symbol] NVARCHAR(32) NOT NULL,
	[MeasureType] INT NOT NULL,
	[BaseMeasureUnitId] INT NOT NULL,
	[ConvertionFactorToBase] FLOAT,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
