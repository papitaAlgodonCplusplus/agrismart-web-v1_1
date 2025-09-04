CREATE TABLE [dbo].[Measurement]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [RecordDate] DATETIME NOT NULL, 
    [CropProductionId] INT NOT NULL,
	[MeasurementVariableId] INT NOT NULL, 
	[MinValue] FLOAT NOT NULL,
    [MaxValue] FLOAT NOT NULL,
    [AvgValue] FLOAT NOT NULL,
    [SumValue] FLOAT NULL,
)
