CREATE TABLE [dbo].[ProductionUnit]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,
	[FarmId] INT NOT NULL,
    [ProductionUnitTypeId] INT NOT NULL,
	[Name] NVARCHAR(64) NOT NULL,
	[Description] NVARCHAR(128) NULL,
	[Polygon] GEOMETRY NULL, 
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL,
    CONSTRAINT [FK_ProductionUnit_ToFarm] FOREIGN KEY ([FarmId]) REFERENCES [Farm]([Id]), 
    CONSTRAINT [FK_ProductionUnit_ToProductionUnitType] FOREIGN KEY ([ProductionUnitTypeId]) REFERENCES [ProductionUnitType]([Id])
 )
