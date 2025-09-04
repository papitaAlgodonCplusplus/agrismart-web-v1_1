CREATE TABLE [dbo].[MeasurementType]
(
	[Id] INT NOT NULL PRIMARY KEY, 
    [Name] NVARCHAR(50) NOT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
