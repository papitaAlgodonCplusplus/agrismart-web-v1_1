CREATE TABLE [dbo].[IrrigationMeasurement]
(
	[Id] BIGINT NOT NULL PRIMARY KEY IDENTITY, 
    [RecordDateTime] DATETIME NOT NULL, 
    [CropProductionId] INT NOT NULL,
    [DateTimeStart] DATETIME NOT NULL, 
    [DateTimeEnd] DATETIME NOT NULL, 
    [IrrigationVolume] FLOAT NOT NULL,
    [DrainVolume] FLOAT NOT NULL,
    [DateCreated] DATETIME NOT NULL DEFAULT GETDATE()
)
