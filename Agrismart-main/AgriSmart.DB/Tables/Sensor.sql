CREATE TABLE [dbo].[Sensor]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[DeviceId] INT NOT NULL,
	[SensorLabel] NVARCHAR(32) NOT NULL,
	[Description] NVARCHAR(64) NOT NULL,
	[MeasurementVariableId] INT NOT NULL,
	[NumberOfContainers] INT NOT NULL DEFAULT 1,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)
GO

CREATE NONCLUSTERED INDEX IX_Sensor_SensorLabel_DeviceId
ON dbo.Sensor (SensorLabel, DeviceId);
