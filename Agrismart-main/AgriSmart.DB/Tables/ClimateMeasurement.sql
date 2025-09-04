CREATE TABLE [dbo].[ClimateMeasurement]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [RecordDateTime] DATETIME NOT NULL, 
    [CropProductionId] INT NOT NULL,
    [MinTemperature] FLOAT NOT NULL,
    [MaxTemperature] FLOAT NOT NULL,
    [AvgTemperature] FLOAT NOT NULL,
    [MinHumidity] FLOAT NOT NULL,
    [MaxHumidity] FLOAT NOT NULL,
    [AvgHumidity] FLOAT NOT NULL,
    [MinWindSpeed] FLOAT NOT NULL,
    [MaxWindSpeed] FLOAT NOT NULL,
    [AvgWindSpeed] FLOAT NOT NULL,
	[WindSpeedMeasurementHeight] FLOAT NOT NULL,
	[MinTotalSolarRadiation] FLOAT NOT NULL,
    [MaxTotalSolarRadiation] FLOAT NOT NULL,
    [AvgTotalSolarRadiation] FLOAT NOT NULL,
    [DateCreated] DATETIME NOT NULL DEFAULT GETDATE()
)

