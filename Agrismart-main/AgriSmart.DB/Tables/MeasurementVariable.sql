CREATE TABLE [dbo].[MeasurementVariable]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[MeasurementVariableStandardId] INT NOT NULL,
	[CatalogId] INT NOT NULL,
    [Name] varchar(64) NOT NULL, 
	[MeasurementUnitId] INT NOT NULL ,
	[FactorToMeasurementVariableStandard] float NOT NUll Default 1,
	[Active] BIT NOT NULL DEFAULT 1,	
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
