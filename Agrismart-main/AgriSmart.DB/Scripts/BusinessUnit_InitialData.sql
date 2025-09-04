
/************CLIENTS************/
INSERT INTO [dbo].[Client] ([Name],[CreatedBy]) VALUES ('UCR',1)

/************catalog************/
INSERT INTO [dbo].[Catalog] ([ClientId],[Name], [CreatedBy]) VALUES (1, 'Catalogo UCR', 1)

INSERT INTO [dbo].[CalculationSetting] ([CatalogId], [Name], [Value], [CreatedBy])
VALUES
(1, 'PipelinePressureMeasurementVariableId', -1, 1),
(1, 'IrrigationInputVolumeMeasurementVariableId', -1, 1),
(1, 'IrrigationDrainVolumeMeasurementVariableId', -1, 1)

/************COMPANIES************/
INSERT INTO [dbo].[Company] ([ClientId],[CatalogId],[Name],[Description],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Client] WHERE [Name] = 'UCR'),1,'Estacion Pruebas UCR','Estacion Pruebas UCR',1)

/************FARMS************/
INSERT INTO [dbo].[Farm] ([CompanyId],[Name],[Description],[TimeZoneName],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Company] WHERE [Name] = 'Estacion Pruebas UCR'),'Estación Fabio Baurit','Estación Fabio Baurit en La Garita','Central Standard Time',1)

/************PRODUCTION UNITS************/
INSERT INTO [dbo].[ProductionUnit] ([FarmId],[ProductionUnitTypeId],[Name],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Farm] WHERE [Name] = 'Estación Fabio Baurit'),2,'Invernadero en Estación Fabio Baurid',1)

/***********CROP PRODUCTION************/
INSERT INTO [dbo].[CropProduction] ([CropId],[ProductionUnitId],[Name],[ContainerId],[GrowingMediumId],[DropperId],[Width],[Length],[BetweenRowDistance],[BetweenContainerDistance],[BetweenPlantDistance],[PlantsPerContainer],[NumberOfDroppersPerContainer],[WindSpeedMeasurementHeight],[StartDate],[EndDate],[Altitude],[Latitude],[Longitude],[DepletionPercentage],[DrainThreshold],[CreatedBy]) 
                                 VALUES (13,1,'Producción de Lechuga 2',1,1,1,4.5,6,1.5,0,0.1,10,'2025-01-10','2025-02-10',0.5,1200,10,0,1)
INSERT INTO [dbo].[CropProduction] ([CropId],[ProductionUnitId],[Name],[ContainerId],[GrowingMediumId],[Width],[Length],[BetweenRowDistance],[BetweenContainerDistance],[BetweenPlantDistance], [PlantsPerContainer], [StartDate],[EndDate],[WindSpeedMeasurementHeight],[Altitude],[LatitudeGrades],[LatitudeMinutes],[CreatedBy]) VALUES (2,1,'Produccion de tomate 2',1,1,10,10,5,5,1,1,'2024-05-27','2024-12-31',0.5,1200,10,0,1)

/***********DROPPER************/
INSERT INTO [dbo].[Dropper] ([CatalogId],[Name],[FlowRate],[CreatedBy]) VALUES (1,'Goterio Nandanyan',2,1)

/***********CONTAINER************/
INSERT INTO [dbo].[Container] ([CatalogId],[Name],[ContainerTypeId],[Height],[Width],[Length],[LowerDiameter],[UpperDiameter],[CreatedBy]) VALUES (1,'Tabla Fico',2,13,14,100,0,0,1)

/*************USER*********************/
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (0, 1, 'ebrecha@iapsoft.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (1, 2, 'ebrecha@gmail.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (1, 3, 'ebrecha@yahoo.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (0, 4, 'agronomicProcess', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (0, 1, 'csolano@iapcr.com', '123', 1,1)
INSERT INTO [dbo].[User] ([ClientId],[ProfileId],[UserEmail],[Password], [UserStatusId], [CreatedBy]) VALUES (1, 3, 'eitheljose12@gmail.com', '123', 1,1)


/*************USER FARM****************/
INSERT INTO [dbo].[UserFarm] ([UserId], [FarmId], [Active], [CreatedBy]) VALUES (3,1,1,1)
INSERT INTO [dbo].[UserFarm] ([UserId], [FarmId], [Active], [CreatedBy]) VALUES (6,2,1,1)

/*MQTT Devices*/
INSERT INTO [dbo].[Device] ([CompanyId], [DeviceId],[CreatedBy]) VALUES ((SELECT [Id] FROM [dbo].[Company] WHERE [Name] = 'Estacion Pruebas UCR'), 'EM01UCR', 1)

/*HTTP Devices*/
INSERT INTO [dbo].[Device] ([CompanyId],[DeviceId],[CreatedBy]) VALUES (1,'eui-a84041d62185293d', 1) 

INSERT INTO [dbo].[CropProductionDevice] ([CropProductionId], [DeviceId], [CreatedBy]) VALUES (1,1,1)
INSERT INTO [dbo].[CropProductionDevice] ([CropProductionId], [DeviceId], [CreatedBy]) VALUES (2,2,1)


INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Contenido Volumétrico de Agua_CV',68,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Condutividad Eléctrica_CE',69,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Temperatura del Suelo_T° Suelo',42,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Radiación Solar_RadS',70,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Temperatura de Aire_T° Aire',42,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Humedad relativa aire_HR',68,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Radiacion Foto Activa_RadFA',70,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Velocidad de Viento_V-V',43,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Dirección del Viento_DV',71,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Precipitación_ Prec',11,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Irrigation Volume',11,1)
INSERT INTO [dbo].[MeasurementVariableStandard] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('Drain Volume',11,1)

INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (1,1,'Contenido Volumétrico de Agua_CV',68,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (2,1,'Condutividad Eléctrica_CE',69,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (3,1,'Temperatura del Suelo_T° Suelo',42,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (4,1,'Radiación Solar_RadS',70,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (5,1,'Temperatura de Aire_T° Aire',42,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (6,1,'Humedad relativa aire_HR',68,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (7,1,'Radiacion Foto Activa_RadFA',70,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (8,1,'Velocidad de Viento_V-V',43,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (9,1,'Dirección del Viento_DV',71,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (10,1,'Precipitación_ Prec',11,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (19,1,'Irrigation Volume',11,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (20,1,'Drain Volume',11,1)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (1,1,'Presion inicial de tubería al inicio del Riego',61,8)
INSERT INTO [dbo].[MeasurementVariable] ([MeasurementVariableStandardId],[CatalogId],[Name],[MeasurementUnitId],[CreatedBy]) VALUES (1,1,'Presion máxima de tubería durante del Riego',61,8)


INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (1,'EMS01','Temperature',5,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (1,'EMS02','Humidity',6,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (1,'EMS03','Wind Speed',8,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (1,'EMS04','Wind Direction',9,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (1,'EMS05','Precipitation',10,1)

INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (2,'TEM','Temperature',5,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (2,'HUM','Humidity',6,1)
INSERT INTO [dbo].[Sensor] ([DeviceId],[SensorLabel],[Description],[MeasurementVariableId],[CreatedBy]) VALUES (2,'wind_speed','Wind Speed',8,1)

