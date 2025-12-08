-- Check which columns have NULL values for SoilAnalysis ID 16
SELECT
    CASE WHEN Id IS NULL THEN 'Id' ELSE NULL END AS NullColumn1,
    CASE WHEN Active IS NULL THEN 'Active' ELSE NULL END AS NullColumn2,
    CASE WHEN CropProductionId IS NULL THEN 'CropProductionId' ELSE NULL END AS NullColumn3,
    CASE WHEN SampleDate IS NULL THEN 'SampleDate' ELSE NULL END AS NullColumn4,
    CASE WHEN AnalyticalEntityId IS NULL THEN 'AnalyticalEntityId' ELSE NULL END AS NullColumn5,
    CASE WHEN CreatedBy IS NULL THEN 'CreatedBy' ELSE NULL END AS NullColumn6,
    CASE WHEN UpdatedBy IS NULL THEN 'UpdatedBy' ELSE NULL END AS NullColumn7
FROM SoilAnalysis
WHERE Id = 16;

-- Show all values for this record
SELECT * FROM SoilAnalysis WHERE Id = 16;
