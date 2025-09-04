CREATE TABLE [dbo].[MeasurementKPI]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [RecordDate] DATETIME NOT NULL, 
    [CropProductionId] INT NOT NULL,
	[KPIId] INT NOT NULL, 
	[MinValue] FLOAT NOT NULL,
    [MaxValue] FLOAT NOT NULL,
    [AvgValue] FLOAT NOT NULL,
    [SumValue] FLOAT NULL,
)
