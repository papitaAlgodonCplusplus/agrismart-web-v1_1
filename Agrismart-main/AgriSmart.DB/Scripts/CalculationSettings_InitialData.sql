-- ============================================================================
-- CalculationSettings initial seed data
-- CatalogId = 1 (Default catalog created in Catalog_InitialData.sql)
-- CreatedBy = 1 (system super user)
--
-- NOTE: All *MeasurementVariableId values must match actual rows in the
--       [MeasurementVariable] table for your environment. The values below
--       are representative defaults; update them after verifying the IDs.
-- ============================================================================

-- -----------------------------------------------------------------------
-- Threshold / numeric settings (IsMeasurementVariable = 0)
-- -----------------------------------------------------------------------
INSERT INTO [dbo].[CalculationSettings]
    ([CatalogId],[Name],[Value],[IsMeasurementVariable],[CreatedBy])
VALUES
    (1, 'PressureDeltaThreshold',                         0.002, 0, 1),
    (1, 'IrrigationPressureThreshold',                    0.1,   0, 1),
    (1, 'MaxVolumetricWaterContentLastReadingDelayMinutes',30,    0, 1),
    (1, 'MaxElectroConductivityLastReadingDelayMinutes',   30,    0, 1);

-- -----------------------------------------------------------------------
-- Measurement variable ID mappings (IsMeasurementVariable = 1)
-- The Value column stores the MeasurementVariable.Id integer.
-- -----------------------------------------------------------------------
INSERT INTO [dbo].[CalculationSettings]
    ([CatalogId],[Name],[Value],[IsMeasurementVariable],[CreatedBy])
VALUES
    -- Core irrigation / drain volumes (used by Angular getIrrigationEventsVolumes)
    (1, 'IrrigationVolume',                                        1,  1, 1),
    (1, 'DrainVolume',                                             2,  1, 1),

    -- Pressure measurements
    (1, 'PipelinePressureMeasurementVariableId',                   3,  1, 1),
    (1, 'InitialPressureMeasurementVariableId',                    4,  1, 1),
    (1, 'MaximumPressureMeasurementVariableId',                    5,  1, 1),

    -- Derived irrigation metrics
    (1, 'IrrigationIntervalMeasurementVariableId',                 6,  1, 1),
    (1, 'IrrigationLengthMeasurementVariableId',                   7,  1, 1),
    (1, 'IrrigationVolumenM2MeasurementVariableId',                8,  1, 1),
    (1, 'IrrigationVolumenPerPlantMeasurementVariableId',          9,  1, 1),
    (1, 'IrrigationVolumenTotalMeasurementVariableId',             10, 1, 1),
    (1, 'IrrigationFlowMeasurementVariableId',                     11, 1, 1),

    -- Drain metrics
    (1, 'DrainVolumenM2MeasurementVariableId',                     12, 1, 1),
    (1, 'DrainVolumenPerPlantMeasurementVariableId',               13, 1, 1),
    (1, 'DrainPercentageMeasurementVariableId',                    14, 1, 1),
    (1, 'DrainDelayMeasurementVariableId',                         15, 1, 1),
    (1, 'DrainLengthMeasurementVariableId',                        16, 1, 1),

    -- Soil moisture (volumetric water content)
    (1, 'GrowingMediumVolumetricWaterContentMeasurementVariableId',17, 1, 1),
    (1, 'MinVolumetricHumedityAtIrrigationStartMeasurementVariableId', 18, 1, 1),
    (1, 'MaxVolumetricHumedityAtIrrigationEndMeasurementVariableId',   19, 1, 1),

    -- Electro-conductivity
    (1, 'ElectroCondutivityMeasurementVariableId',                 20, 1, 1),
    (1, 'MinElectroConductivityAtIrrigationStartMeasurementVariableId',21, 1, 1),
    (1, 'MaxElectroConductivityAtIrrigationEndMeasurementVariableId',  22, 1, 1);
