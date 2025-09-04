CREATE TABLE [dbo].[IrrigationEvent]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [RecordDateTime] DATETIME NOT NULL, 
    [CropProductionId] INT NOT NULL,
    [DateTimeStart] DATETIME NOT NULL, 
    [DateTimeEnd] DATETIME NOT NULL, 
)
