CREATE TABLE [dbo].[MeasurementVariableStandard]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [Name] varchar(64) NOT NULL, 
	[MeasurementUnitId] INT NOT NULL ,
	[Active] BIT NOT NULL DEFAULT 1,	
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
