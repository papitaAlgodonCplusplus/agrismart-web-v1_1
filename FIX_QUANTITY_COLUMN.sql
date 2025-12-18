-- =============================================
-- Fix: Make Quantity column nullable in NutrientFormulationRecipeFertilizer
-- Date: 2025-12-17
-- Reason: Column exists in DB but not in entity model
-- =============================================

USE AgriSmart;
GO

PRINT 'Fixing Quantity column...';

-- Make Quantity column nullable if it exists
IF EXISTS (SELECT * FROM sys.columns
           WHERE object_id = OBJECT_ID(N'[dbo].[NutrientFormulationRecipeFertilizer]')
           AND name = 'Quantity')
BEGIN
    ALTER TABLE [dbo].[NutrientFormulationRecipeFertilizer]
    ALTER COLUMN Quantity FLOAT NULL;

    PRINT 'Quantity column is now nullable';
END
ELSE
BEGIN
    PRINT 'Quantity column does not exist';
END

PRINT 'Fix completed!';
GO
