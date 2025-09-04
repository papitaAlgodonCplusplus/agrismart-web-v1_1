CREATE TABLE [dbo].[IrrigationMeasurement]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [EventId] INT NOT NULL, 
    [MeasurementVariableId] INT NOT NULL,
    [RecordValue] FLOAT NOT NULL,
    [DateCreated] DATETIME NOT NULL DEFAULT GETDATE()
)
