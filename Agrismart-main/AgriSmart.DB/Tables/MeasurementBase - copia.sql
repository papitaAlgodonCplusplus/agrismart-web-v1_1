CREATE TABLE [dbo].[MeasurementBase]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [RecordDate] DATETIME NOT NULL, 
    [CropProductionId] INT NOT NULL,
	[MeasurementVariableId] INT NOT NULL, 
	[RecordValue] FLOAT NOT NULL,
)
