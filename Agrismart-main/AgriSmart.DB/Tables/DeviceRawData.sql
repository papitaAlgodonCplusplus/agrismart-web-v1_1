CREATE TABLE [dbo].[DeviceRawData]
(
    [Id] INT NOT NULL PRIMARY KEY IDENTITY,
    [RecordDate] DATETIME NOT NULL, 
	[ClientId] NVARCHAR(32) NOT NULL,
    [UserId] NVARCHAR(32) NOT NULL,
    [DeviceId] NVARCHAR(32) NOT NULL,
    [Sensor] NVARCHAR(32) NOT NULL,
    [Payload] NVARCHAR(32) NOT NULL,
    [Summarized] BIT NOT NULL DEFAULT 0
)

CREATE NONCLUSTERED INDEX IX_DeviceRawData_Summarized_RecordDate
ON dbo.DeviceRawData (Summarized, RecordDate);
