CREATE TABLE [dbo].[Device]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[CompanyId] INT NOT NULL,
	[DeviceId] NVARCHAR(32) NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
	CONSTRAINT [FK_Device_ToCompany] FOREIGN KEY ([CompanyId]) REFERENCES [Company]([Id])
)
GO

CREATE NONCLUSTERED INDEX IX_Device_DeviceId
ON dbo.Device (DeviceId);
