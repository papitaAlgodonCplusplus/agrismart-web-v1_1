CREATE TABLE [dbo].[CropProductionDevice]
(	
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [CropProductionId] INT NOT NULL,
    [DeviceId] INT NOT NULL, 
	[StartDate] DATETIME NOT NULL,
    [Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)

CREATE NONCLUSTERED INDEX IX_CropProductionDevice_DeviceId_CropProductionId
ON dbo.CropProductionDevice (DeviceId, CropProductionId);


