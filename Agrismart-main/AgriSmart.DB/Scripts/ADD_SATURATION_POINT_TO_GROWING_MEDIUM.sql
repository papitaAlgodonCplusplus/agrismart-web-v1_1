-- Migration: Add SaturationPoint to GrowingMedium
-- SaturationPoint = volumetric water content (%) at 0 kPa (full saturation)
-- Solid fraction = 100 - SaturationPoint (the curve can never exceed SaturationPoint)
-- Typical value: ~95.8% for peat-based substrates

ALTER TABLE [dbo].[GrowingMedium]
    ADD [SaturationPoint] FLOAT NOT NULL DEFAULT 95.8;
