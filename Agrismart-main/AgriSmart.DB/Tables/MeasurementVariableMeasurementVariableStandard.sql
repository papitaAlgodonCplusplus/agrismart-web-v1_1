CREATE TABLE [dbo].[MeasurementVariableMeasurementVariableStandard]
(	
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [MeasurementVariableId] INT NOT NULL,
    [MeasurementVariableStandardId] INT NOT NULL, 
    [Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)


