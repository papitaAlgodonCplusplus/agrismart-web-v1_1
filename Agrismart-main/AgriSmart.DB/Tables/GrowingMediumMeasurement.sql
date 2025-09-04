CREATE TABLE [dbo].[GrowingMediumMeasurement]
(
[Id] INT NOT NULL PRIMARY KEY IDENTITY,
[Date] DATETIME NOT NULL,
[VolumetricWaterContent] FLOAT NULL,
[CropProductionId] INT NOT NULL
)