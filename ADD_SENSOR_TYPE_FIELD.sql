-- Migration: Add SensorType column to Sensor table
-- Purpose: Allow sensors to be categorized by what they measure
-- (e.g., "Water Flow Sensor", "Rain Gauge", "Soil Temperature")
-- so that frontend components can query by type instead of hardcoded label names.

ALTER TABLE [dbo].[Sensor]
ADD [SensorType] NVARCHAR(64) NULL;
GO

-- Update existing sensors based on known SensorLabel patterns (optional, adjust to your data)
UPDATE [dbo].[Sensor] SET [SensorType] = 'Water Flow Sensor' WHERE [SensorLabel] = 'Water_flow_value';
UPDATE [dbo].[Sensor] SET [SensorType] = 'Pulse Counter'     WHERE [SensorLabel] = 'Total_pulse';
UPDATE [dbo].[Sensor] SET [SensorType] = 'Rain Gauge'        WHERE [SensorLabel] = 'Rain_gauge';
UPDATE [dbo].[Sensor] SET [SensorType] = 'Soil Temperature'  WHERE [SensorLabel] IN ('temp_SOIL', 'TEMP_SOIL', 'temp_DS18B20', 'TempC_DS18B20');
UPDATE [dbo].[Sensor] SET [SensorType] = 'Soil Humidity'     WHERE [SensorLabel] IN ('HUM', 'Hum_SHT2x', 'water_SOIL', 'water_SOIL_original');
GO
