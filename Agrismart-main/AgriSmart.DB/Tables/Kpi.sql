CREATE TABLE [dbo].[KPI]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY,	
	[Name] nvarchar(64) NOT NULL,	
	[MeasurementUnitId] INT NOT NULL,
	[Active] BIT NOT NULL DEFAULT 1, 
	[DateCreated] DATETIME NOT NULL DEFAULT GETDATE(),
	[DateUpdated] DATETIME NULL,
	[CreatedBy] INT NOT NULL,
	[UpdatedBy] INT NULL
)


select * from [dbo].[MeasurementUnit]
select * from [dbo].[MeasurementVariable]
select * from [dbo].[IrrigationMeasurement]
select * from [dbo].[KPI]

INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('SaturationVaporPressure',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('RealVaporPressure',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('VaporPressureDeficit',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('ExtraTerrestrialRadiationAsEnergy',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('ExtraTerrestrialRadiationAsWater',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IncidentSolarRadiation',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('SolarRadiationForAClearDay',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('NetShortwaveSolarRadiation',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('NetLongwaveSolarRadiation',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('NetSolarRadiation',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('AerodynamicResistance',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('ReferenceCropSurfaceResistance',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('EvapotranspirationRadiationTerm',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('AerodynamicEvapotranspirationRadiationTerm',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('EvapotranspirationReferencePenmanMontiehtFAO56',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('EvapotranspirationReferenceHargreaves',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('CropEvapoTranspiration',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('DegreesDay',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('LightIntegralPAR',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('LightIntegralGlobal',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationCount',1,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationVolumenTotal',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationVolumenM2',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationVolumenPerPlant',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('DrainVolumenM2',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('DrainVolumenPerPlant',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('DrainPercentage',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationFlow',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationPrecipitation',10,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationInterval',48,1)
INSERT INTO [dbo].[KPI] ([Name],[MeasurementUnitId],[CreatedBy]) VALUES ('IrrigationLength',48,1)