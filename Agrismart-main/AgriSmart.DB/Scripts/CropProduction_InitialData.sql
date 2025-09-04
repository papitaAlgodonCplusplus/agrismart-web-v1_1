INSERT INTO [dbo].[CropProduction]
           ([CropId]
           ,[ProductionUnitId]
           ,[Name]
           ,[ContainerId]
           ,[GrowingMediumId]
           ,[Width]
           ,[Length]
           ,[BetweenRowDistance]
           ,[BetweenContainerDistance]
           ,[StartDate]
           ,[EndDate]
           ,[CreatedBy])
VALUES
(1,1,'Produccion 1 Trimestre Campo en Estación Fabio Baurid',1,1,10,10,5,5,'2023-01-01','2023-03-31',1),
(2,2,'Produccion 1 Trimestre Invernadero en Estación Fabio Baurid',1,1,10,10,5,5,'2023-01-01','2023-03-31',1),
(2,3,'Produccion 1 Trimestre Invernadero 1',1,1,10,10,5,5,'2023-01-01','2023-03-31',1)
