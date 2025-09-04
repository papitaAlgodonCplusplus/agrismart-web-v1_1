CREATE TABLE [dbo].[UserFarm]
(
	[UserId] INT NOT NULL,
	[FarmId] INT NOT NULL,
	[Active] BIT NOT NULL DEFAULT 1,
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
	CONSTRAINT [FK_UserFarm_ToUser] FOREIGN KEY ([UserId]) REFERENCES [User]([Id]),
	CONSTRAINT [FK_UserFarm_ToFarm] FOREIGN KEY ([FarmId]) REFERENCES [Farm]([Id]), 
    CONSTRAINT [PK_UserFarm] PRIMARY KEY ([UserId], [FarmId])
)