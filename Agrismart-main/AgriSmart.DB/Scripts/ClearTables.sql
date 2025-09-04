/************CLIENTS************/
INSERT INTO [dbo].[Client] ([Name],[CreatedBy]) VALUES ('UCR',1)

/************catalog************/
INSERT INTO [dbo].[Catalog] ([ClientId],[Name], [CreatedBy]) VALUES (1, 'Catalogo UCR', 1)

/************COMPANIES************/
INSERT INTO [dbo].[Company] ([ClientId],[CatalogId],[Name],[Description],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Client] WHERE [Name] = 'UCR'),1,'Estacion Pruebas UCR','Estacion Pruebas UCR',1)

/************FARMS************/
INSERT INTO [dbo].[Farm] ([CompanyId],[Name],[Description],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Company] WHERE [Name] = 'Estacion Pruebas UCR'),'Estación Fabio Baurit','Estación Fabio Baurit en La Garita',1)

/************PRODUCTION UNITS************/
INSERT INTO [dbo].[ProductionUnit] ([FarmId],[ProductionUnitTypeId],[Name],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Farm] WHERE [Name] = 'Estación Fabio Baurit'),2,'Invernadero en Estación Fabio Baurid',1)

/***********CROP PRODUCTION************/
INSERT INTO [dbo].[CropProduction] ([CropId],[ProductionUnitId],[Name],[ContainerId],[GrowingMediumId],[Width],[Length],[BetweenRowDistance],[BetweenContainerDistance],[StartDate],[EndDate],[CreatedBy]) VALUES (2,1,'Producción de Tomate 1',1,1,10,10,5,5,'2024-09-12','2024-11-29',1)
INSERT INTO [dbo].[CropProduction] ([CropId],[ProductionUnitId],[Name],[ContainerId],[GrowingMediumId],[Width],[Length],[BetweenRowDistance],[BetweenContainerDistance],[StartDate],[EndDate],[CreatedBy]) VALUES (2,1,'Produccion de Tomate 2',1,1,10,10,5,5,'2023-01-01','2023-03-31',1)

select * from [dbo].[CropProduction]

/*************USER*********************/
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (0, 1, 'ebrecha@iapsoft.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (1, 2, 'ebrecha@gmail.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (1, 3, 'ebrecha@yahoo.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (0, 4, 'agronomicProcess', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (0, 1, 'csolano@iapcr.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (1, 3, 'eitheljose12@gmail.com', '123', 1,1)

/*************USER FARM****************/
INSERT INTO [dbo].[UserFarm] ([UserId], [FarmId], [Active], [CreatedBy]) VALUES (3,1,1,1)
INSERT INTO [dbo].[UserFarm] ([UserId], [FarmId], [Active], [CreatedBy]) VALUES (6,1,1,1)

/*MQTT Devices*/
INSERT INTO [dbo].[Device] ([CompanyId], [DeviceId],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Company] WHERE [Name] = 'Estacion Pruebas UCR'), 'EM01UCR',1)

/*HTTP Devices*/
INSERT INTO [dbo].[Device] ([CompanyId],[DeviceId],[CreatedBy]) VALUES (1,'eui-a84041d62185293d', 1) 

INSERT INTO [dbo].[CropProductionDevice] ([CropProductionId], [DeviceId], [CreatedBy]) VALUES (1,1,1)
INSERT INTO [dbo].[CropProductionDevice] ([CropProductionId], [DeviceId], [CreatedBy]) VALUES (2,2,1)

INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (1,'EMS01','Temperature',0,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (1,'EMS02','Humidity',2,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (1,'EMS03','Wind Speed',4,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (1,'EMS04','Wind Direction',6,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (1,'EMS05','Precipitation',8,1)

INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (2,'TEM','Temperature',-1,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (2,'HUM','Humidity',-1,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[CreatedBy]) VALUES (2,'wind_speed','Wind Speed',-1,1)
