-- Update SoilAnalysis decimal column types to fix overflow issues
-- This script modifies column precision/scale to accommodate the actual data ranges

USE [AgriSmartDB]
GO

-- Physical properties - percentages (0-100)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [SandPercent] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [SiltPercent] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [ClayPercent] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [OrganicMatterPercent] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [BaseSaturationPercent] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [BasePercentCa] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [BasePercentMg] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [BasePercentK] DECIMAL(5,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [BasePercentNa] DECIMAL(5,2) NULL;

-- pH (3.0-10.0)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [PhSoil] DECIMAL(4,2) NULL;

-- Bulk density (typically 0.5-2.5 g/cm3)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [BulkDensity] DECIMAL(5,3) NULL;

-- Electrical conductivity (can be higher, in dS/m or mS/cm)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [ElectricalConductivity] DECIMAL(8,3) NULL;

-- CEC (typically 0-60 meq/100g)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [CationExchangeCapacity] DECIMAL(6,2) NULL;

-- Nutrients in ppm (can range from 0-10000+ ppm)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [NitrateNitrogen] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [AmmoniumNitrogen] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [TotalNitrogen] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Phosphorus] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Potassium] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Calcium] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [CalciumCarbonate] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Magnesium] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Sulfur] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Sodium] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Chloride] DECIMAL(10,2) NULL;

-- Micronutrients in ppm (typically 0-1000 ppm)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Iron] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Manganese] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Zinc] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Copper] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Boron] DECIMAL(10,2) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [Molybdenum] DECIMAL(10,2) NULL;

-- Ratios (can vary widely)
ALTER TABLE [SoilAnalysis] ALTER COLUMN [CaToMgRatio] DECIMAL(8,3) NULL;
ALTER TABLE [SoilAnalysis] ALTER COLUMN [MgToKRatio] DECIMAL(8,3) NULL;

PRINT 'SoilAnalysis decimal types updated successfully';
GO
