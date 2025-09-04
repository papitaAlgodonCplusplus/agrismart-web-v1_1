CREATE TABLE [dbo].[FertiliserIncompatibility]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY, 
    [CatalogId] INT NOT NULL, 
    [FertilizerId] INT NOT NULL,
	[CounterpartFertilizerId] INT NOT NULL, 
	[Code] nvarchar(10) NOT NULL,
    [Type] int NOT NULL,
    [Message] nvarchar(60) NOT NULL,
)