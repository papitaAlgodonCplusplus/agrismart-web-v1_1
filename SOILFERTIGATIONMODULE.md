# 📘 **DETAILED IMPLEMENTATION GUIDE: WEEK 4 - SOIL FERTIGATION MODULE**

---

## 🎯 **OBJECTIVE**
Implement complete soil analysis storage and fertigation calculation support, extending the existing nutrient formulation system to work with soil-based crops. This requires backend API development before frontend implementation.

---

# PART 1: DATABASE SCHEMA (SQL Server)

## 📋 **STEP 1: Create Soil Analysis Table** (30 minutes)

**File**: `Database/Tables/SoilAnalysis.sql`

```sql
-- ============================================================================
-- SOIL ANALYSIS TABLE
-- Stores laboratory soil test results for soil-based crop production
-- ============================================================================

CREATE TABLE dbo.SoilAnalysis (
    -- Primary Key
    Id INT IDENTITY(1,1) PRIMARY KEY,
    
    -- Foreign Keys
    CropProductionId INT NOT NULL,
    AnalyticalEntityId INT NULL,        -- Lab that performed analysis
    
    -- Metadata
    SampleDate DATETIME NOT NULL,
    LabReportNumber NVARCHAR(100) NULL,
    LabName NVARCHAR(200) NULL,
    SampleDepth NVARCHAR(50) NULL,      -- e.g., "0-20cm", "20-40cm"
    SampleLocation NVARCHAR(200) NULL,  -- Field location/GPS coordinates
    
    -- Physical Properties - Texture
    SandPercent DECIMAL(5,2) NULL,      -- % (0-100)
    SiltPercent DECIMAL(5,2) NULL,      -- % (0-100)
    ClayPercent DECIMAL(5,2) NULL,      -- % (0-100)
    TextureClass NVARCHAR(50) NULL,     -- Sandy Loam, Clay Loam, etc.
    BulkDensity DECIMAL(5,2) NULL,      -- g/cm³ (typically 1.0-1.6)
    
    -- Chemical Properties - General
    PhSoil DECIMAL(4,2) NULL,           -- pH (4.0-9.0)
    ElectricalConductivity DECIMAL(6,2) NULL,  -- dS/m (salinity indicator)
    OrganicMatterPercent DECIMAL(5,2) NULL,    -- % (0-100)
    CationExchangeCapacity DECIMAL(6,2) NULL,  -- meq/100g or cmol(+)/kg
    
    -- Macronutrients - Nitrogen (ppm or mg/kg)
    NitrateNitrogen DECIMAL(7,2) NULL,      -- NO3-N (ppm)
    AmmoniumNitrogen DECIMAL(7,2) NULL,     -- NH4-N (ppm)
    TotalNitrogen DECIMAL(7,2) NULL,        -- Total N (ppm)
    
    -- Macronutrients - Phosphorus (ppm)
    Phosphorus DECIMAL(7,2) NULL,           -- P - Olsen/Bray/Mehlich method
    PhosphorusMethod NVARCHAR(50) NULL,     -- 'Olsen', 'Bray1', 'Mehlich3', etc.
    
    -- Macronutrients - Potassium (ppm)
    Potassium DECIMAL(7,2) NULL,            -- K - Exchangeable
    
    -- Macronutrients - Calcium (ppm)
    Calcium DECIMAL(7,2) NULL,              -- Ca - Exchangeable
    CalciumCarbonate DECIMAL(5,2) NULL,     -- CaCO3 % (for calcareous soils)
    
    -- Macronutrients - Magnesium (ppm)
    Magnesium DECIMAL(7,2) NULL,            -- Mg - Exchangeable
    
    -- Macronutrients - Sulfur (ppm)
    Sulfur DECIMAL(7,2) NULL,               -- S - Extractable (SO4-S)
    
    -- Secondary Nutrients (ppm)
    Sodium DECIMAL(7,2) NULL,               -- Na - Exchangeable
    Chloride DECIMAL(7,2) NULL,             -- Cl
    
    -- Micronutrients (ppm)
    Iron DECIMAL(7,2) NULL,                 -- Fe - DTPA extractable
    Manganese DECIMAL(7,2) NULL,            -- Mn - DTPA extractable
    Zinc DECIMAL(7,2) NULL,                 -- Zn - DTPA extractable
    Copper DECIMAL(7,2) NULL,               -- Cu - DTPA extractable
    Boron DECIMAL(7,2) NULL,                -- B - Hot water extractable
    Molybdenum DECIMAL(7,2) NULL,           -- Mo - Ammonium oxalate extractable
    
    -- Ratios and Calculated Values
    CaToMgRatio DECIMAL(6,2) NULL,          -- Ideal: 3:1 to 5:1
    MgToKRatio DECIMAL(6,2) NULL,           -- Ideal: 3:1 to 5:1
    BasePercentCa DECIMAL(5,2) NULL,        -- % of CEC occupied by Ca (ideal 60-70%)
    BasePercentMg DECIMAL(5,2) NULL,        -- % of CEC occupied by Mg (ideal 10-20%)
    BasePercentK DECIMAL(5,2) NULL,         -- % of CEC occupied by K (ideal 2-5%)
    BasePercentNa DECIMAL(5,2) NULL,        -- % of CEC occupied by Na (ideal <5%)
    BaseSaturationPercent DECIMAL(5,2) NULL, -- Total base saturation %
    
    -- Interpretation/Recommendations
    InterpretationLevel NVARCHAR(50) NULL,   -- 'Low', 'Medium', 'High', 'Very High'
    Recommendations NVARCHAR(MAX) NULL,      -- Lab recommendations text
    Notes NVARCHAR(MAX) NULL,                -- Additional notes
    
    -- System Fields
    Active BIT NOT NULL DEFAULT 1,
    DateCreated DATETIME NOT NULL DEFAULT GETDATE(),
    DateUpdated DATETIME NULL,
    CreatedBy INT NULL,
    UpdatedBy INT NULL,
    
    -- Constraints
    CONSTRAINT FK_SoilAnalysis_CropProduction 
        FOREIGN KEY (CropProductionId) 
        REFERENCES dbo.CropProduction(Id),
    CONSTRAINT FK_SoilAnalysis_AnalyticalEntity 
        FOREIGN KEY (AnalyticalEntityId) 
        REFERENCES dbo.AnalyticalEntity(Id),
    CONSTRAINT FK_SoilAnalysis_CreatedBy 
        FOREIGN KEY (CreatedBy) 
        REFERENCES dbo.[User](Id),
    CONSTRAINT FK_SoilAnalysis_UpdatedBy 
        FOREIGN KEY (UpdatedBy) 
        REFERENCES dbo.[User](Id),
    
    -- Validation Constraints
    CONSTRAINT CK_SoilAnalysis_TextureSum 
        CHECK (SandPercent IS NULL OR SiltPercent IS NULL OR ClayPercent IS NULL 
               OR (SandPercent + SiltPercent + ClayPercent BETWEEN 98 AND 102)),
    CONSTRAINT CK_SoilAnalysis_PhRange 
        CHECK (PhSoil IS NULL OR PhSoil BETWEEN 3.0 AND 10.0),
    CONSTRAINT CK_SoilAnalysis_PercentRanges 
        CHECK (
            (SandPercent IS NULL OR SandPercent BETWEEN 0 AND 100) AND
            (SiltPercent IS NULL OR SiltPercent BETWEEN 0 AND 100) AND
            (ClayPercent IS NULL OR ClayPercent BETWEEN 0 AND 100) AND
            (OrganicMatterPercent IS NULL OR OrganicMatterPercent BETWEEN 0 AND 100) AND
            (BaseSaturationPercent IS NULL OR BaseSaturationPercent BETWEEN 0 AND 100)
        )
);

-- Indexes
CREATE NONCLUSTERED INDEX IX_SoilAnalysis_CropProduction 
    ON dbo.SoilAnalysis(CropProductionId);

CREATE NONCLUSTERED INDEX IX_SoilAnalysis_SampleDate 
    ON dbo.SoilAnalysis(SampleDate DESC);

CREATE NONCLUSTERED INDEX IX_SoilAnalysis_Active 
    ON dbo.SoilAnalysis(Active) 
    INCLUDE (CropProductionId, SampleDate);

GO

-- ============================================================================
-- AUDIT TRIGGER
-- ============================================================================
CREATE TRIGGER TR_SoilAnalysis_Audit
ON dbo.SoilAnalysis
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE sa
    SET DateUpdated = GETDATE()
    FROM dbo.SoilAnalysis sa
    INNER JOIN inserted i ON sa.Id = i.Id;
END;
GO
```

---

## 📋 **STEP 2: Create Soil Texture Reference Table** (15 minutes)

```sql
-- ============================================================================
-- SOIL TEXTURE CLASSIFICATION TABLE
-- Reference table for USDA soil texture classes
-- ============================================================================

CREATE TABLE dbo.SoilTextureClass (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    TextureClassName NVARCHAR(50) NOT NULL UNIQUE,
    
    -- Texture Triangle Boundaries (USDA classification)
    SandMin DECIMAL(5,2) NOT NULL,
    SandMax DECIMAL(5,2) NOT NULL,
    SiltMin DECIMAL(5,2) NOT NULL,
    SiltMax DECIMAL(5,2) NOT NULL,
    ClayMin DECIMAL(5,2) NOT NULL,
    ClayMax DECIMAL(5,2) NOT NULL,
    
    -- Water Holding Characteristics (typical values)
    TypicalFieldCapacity DECIMAL(5,2) NULL,      -- % volume at 0.33 bar
    TypicalWiltingPoint DECIMAL(5,2) NULL,       -- % volume at 15 bar
    TypicalAvailableWater DECIMAL(5,2) NULL,     -- % volume (FC - WP)
    TypicalSaturatedHydraulicConductivity DECIMAL(7,2) NULL, -- cm/hour
    
    -- Management Characteristics
    DrainageClass NVARCHAR(50) NULL,             -- 'Excellent', 'Good', 'Moderate', 'Poor'
    WorkabilityClass NVARCHAR(50) NULL,          -- 'Easy', 'Moderate', 'Difficult'
    ErosionSusceptibility NVARCHAR(50) NULL,     -- 'Low', 'Moderate', 'High'
    
    Description NVARCHAR(500) NULL,
    Active BIT NOT NULL DEFAULT 1
);

-- Insert USDA Soil Texture Classes
INSERT INTO dbo.SoilTextureClass 
(TextureClassName, SandMin, SandMax, SiltMin, SiltMax, ClayMin, ClayMax, 
 TypicalFieldCapacity, TypicalWiltingPoint, TypicalAvailableWater, Description)
VALUES
('Sand', 85, 100, 0, 15, 0, 10, 9, 4, 5, 'Very coarse texture, excellent drainage, low water holding'),
('Loamy Sand', 70, 90, 0, 30, 0, 15, 12, 6, 6, 'Coarse texture, rapid drainage'),
('Sandy Loam', 50, 80, 0, 50, 0, 20, 18, 9, 9, 'Moderately coarse, good drainage and workability'),
('Loam', 23, 52, 28, 50, 7, 27, 27, 13, 14, 'Medium texture, balanced properties, ideal for most crops'),
('Silt Loam', 0, 50, 50, 88, 0, 27, 33, 15, 18, 'Moderately fine, good water holding, good fertility'),
('Silt', 0, 20, 80, 100, 0, 12, 36, 17, 19, 'Fine texture, high water holding, poor workability when wet'),
('Sandy Clay Loam', 45, 80, 0, 28, 20, 35, 24, 13, 11, 'Moderately coarse, moderate water holding'),
('Clay Loam', 20, 45, 15, 53, 27, 40, 31, 17, 14, 'Moderately fine, good water and nutrient holding'),
('Silty Clay Loam', 0, 20, 40, 73, 27, 40, 35, 19, 16, 'Fine texture, high water holding, slow drainage'),
('Sandy Clay', 45, 65, 0, 20, 35, 55, 27, 17, 10, 'Fine texture with sand, sticky when wet'),
('Silty Clay', 0, 20, 40, 60, 40, 60, 37, 21, 16, 'Very fine, very high water holding, very slow drainage'),
('Clay', 0, 45, 0, 40, 40, 100, 39, 23, 16, 'Very fine texture, very high water and nutrient holding, poor drainage');

GO
```

---

## 📋 **STEP 3: Create Soil Nutrient Availability Factors Table** (15 minutes)

```sql
-- ============================================================================
-- SOIL NUTRIENT AVAILABILITY FACTORS
-- pH-dependent availability coefficients for soil nutrients
-- ============================================================================

CREATE TABLE dbo.SoilNutrientAvailability (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Nutrient NVARCHAR(20) NOT NULL,
    PhRangeMin DECIMAL(4,2) NOT NULL,
    PhRangeMax DECIMAL(4,2) NOT NULL,
    AvailabilityFactor DECIMAL(5,4) NOT NULL,  -- 0.0 to 1.0 (0% to 100%)
    Description NVARCHAR(200) NULL,
    
    CONSTRAINT CK_AvailabilityFactor 
        CHECK (AvailabilityFactor BETWEEN 0 AND 1)
);

-- Insert availability factors by pH range
INSERT INTO dbo.SoilNutrientAvailability (Nutrient, PhRangeMin, PhRangeMax, AvailabilityFactor, Description)
VALUES
-- Nitrogen (relatively stable across pH range)
('N', 4.0, 5.5, 0.60, 'Low availability in acidic soils'),
('N', 5.5, 7.5, 0.75, 'Optimal availability'),
('N', 7.5, 9.0, 0.60, 'Reduced availability in alkaline soils'),

-- Phosphorus (highly pH dependent)
('P', 4.0, 5.5, 0.15, 'Very low - fixed by Fe and Al'),
('P', 5.5, 7.0, 0.40, 'Optimal availability range'),
('P', 7.0, 8.0, 0.25, 'Reduced - fixed by Ca'),
('P', 8.0, 9.0, 0.10, 'Very low - precipitated as Ca phosphates'),

-- Potassium (moderate pH dependency)
('K', 4.0, 5.5, 0.70, 'Good availability in acidic soils'),
('K', 5.5, 8.0, 0.85, 'Optimal availability'),
('K', 8.0, 9.0, 0.75, 'Good availability'),

-- Calcium (higher in alkaline soils)
('Ca', 4.0, 6.0, 0.60, 'Lower availability in acidic soils'),
('Ca', 6.0, 8.5, 0.90, 'High availability'),
('Ca', 8.5, 9.0, 0.85, 'Very high availability'),

-- Magnesium
('Mg', 4.0, 5.5, 0.50, 'Moderate availability'),
('Mg', 5.5, 8.0, 0.75, 'Optimal availability'),
('Mg', 8.0, 9.0, 0.70, 'Good availability'),

-- Sulfur
('S', 4.0, 5.5, 0.60, 'Moderate availability'),
('S', 5.5, 8.0, 0.80, 'Optimal availability'),
('S', 8.0, 9.0, 0.70, 'Reduced availability'),

-- Iron (highly pH dependent)
('Fe', 4.0, 6.0, 0.90, 'High availability in acidic soils'),
('Fe', 6.0, 7.0, 0.60, 'Moderate availability'),
('Fe', 7.0, 8.0, 0.25, 'Low availability'),
('Fe', 8.0, 9.0, 0.05, 'Very low - chlorosis risk'),

-- Manganese
('Mn', 4.0, 6.0, 0.85, 'High availability'),
('Mn', 6.0, 7.5, 0.60, 'Moderate availability'),
('Mn', 7.5, 9.0, 0.20, 'Low availability'),

-- Zinc
('Zn', 4.0, 6.0, 0.75, 'Good availability'),
('Zn', 6.0, 7.0, 0.60, 'Moderate availability'),
('Zn', 7.0, 9.0, 0.25, 'Low availability'),

-- Copper
('Cu', 4.0, 6.0, 0.70, 'Good availability'),
('Cu', 6.0, 7.5, 0.60, 'Moderate availability'),
('Cu', 7.5, 9.0, 0.35, 'Reduced availability'),

-- Boron (relatively stable)
('B', 4.0, 6.0, 0.50, 'Moderate availability'),
('B', 6.0, 8.0, 0.70, 'Optimal availability'),
('B', 8.0, 9.0, 0.60, 'Good availability'),

-- Molybdenum (increases with pH - opposite of most micronutrients)
('Mo', 4.0, 5.5, 0.20, 'Very low in acidic soils'),
('Mo', 5.5, 7.0, 0.60, 'Moderate availability'),
('Mo', 7.0, 9.0, 0.90, 'High availability in alkaline soils');

GO
```

---

## 📋 **STEP 4: Create Stored Procedures** (30 minutes)

```sql
-- ============================================================================
-- STORED PROCEDURE: Get Soil Analysis by Crop Production
-- ============================================================================
CREATE PROCEDURE dbo.sp_GetSoilAnalysisByCropProduction
    @CropProductionId INT,
    @IncludeInactive BIT = 0
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        sa.*,
        stc.TextureClassName,
        stc.TypicalFieldCapacity,
        stc.TypicalWiltingPoint,
        stc.TypicalAvailableWater,
        ae.Name AS LabEntityName
    FROM dbo.SoilAnalysis sa
    LEFT JOIN dbo.SoilTextureClass stc ON sa.TextureClass = stc.TextureClassName
    LEFT JOIN dbo.AnalyticalEntity ae ON sa.AnalyticalEntityId = ae.Id
    WHERE sa.CropProductionId = @CropProductionId
      AND (sa.Active = 1 OR @IncludeInactive = 1)
    ORDER BY sa.SampleDate DESC;
END;
GO

-- ============================================================================
-- STORED PROCEDURE: Calculate Nutrient Availability
-- Returns available nutrient concentration based on soil test and pH
-- ============================================================================
CREATE PROCEDURE dbo.sp_CalculateSoilNutrientAvailability
    @SoilAnalysisId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Ph DECIMAL(4,2);
    
    -- Get soil pH
    SELECT @Ph = PhSoil
    FROM dbo.SoilAnalysis
    WHERE Id = @SoilAnalysisId;
    
    -- Return available nutrients
    SELECT 
        'N' AS Nutrient,
        sa.TotalNitrogen AS SoilTestValue,
        ISNULL(sna.AvailabilityFactor, 0.60) AS AvailabilityFactor,
        sa.TotalNitrogen * ISNULL(sna.AvailabilityFactor, 0.60) AS AvailableNutrient
    FROM dbo.SoilAnalysis sa
    LEFT JOIN dbo.SoilNutrientAvailability sna 
        ON sna.Nutrient = 'N' 
        AND @Ph BETWEEN sna.PhRangeMin AND sna.PhRangeMax
    WHERE sa.Id = @SoilAnalysisId
    
    UNION ALL
    
    SELECT 
        'P' AS Nutrient,
        sa.Phosphorus,
        ISNULL(sna.AvailabilityFactor, 0.25),
        sa.Phosphorus * ISNULL(sna.AvailabilityFactor, 0.25)
    FROM dbo.SoilAnalysis sa
    LEFT JOIN dbo.SoilNutrientAvailability sna 
        ON sna.Nutrient = 'P' 
        AND @Ph BETWEEN sna.PhRangeMin AND sna.PhRangeMax
    WHERE sa.Id = @SoilAnalysisId
    
    UNION ALL
    
    SELECT 
        'K' AS Nutrient,
        sa.Potassium,
        ISNULL(sna.AvailabilityFactor, 0.80),
        sa.Potassium * ISNULL(sna.AvailabilityFactor, 0.80)
    FROM dbo.SoilAnalysis sa
    LEFT JOIN dbo.SoilNutrientAvailability sna 
        ON sna.Nutrient = 'K' 
        AND @Ph BETWEEN sna.PhRangeMin AND sna.PhRangeMax
    WHERE sa.Id = @SoilAnalysisId
    
    UNION ALL
    
    SELECT 
        'Ca' AS Nutrient,
        sa.Calcium,
        ISNULL(sna.AvailabilityFactor, 0.85),
        sa.Calcium * ISNULL(sna.AvailabilityFactor, 0.85)
    FROM dbo.SoilAnalysis sa
    LEFT JOIN dbo.SoilNutrientAvailability sna 
        ON sna.Nutrient = 'Ca' 
        AND @Ph BETWEEN sna.PhRangeMin AND sna.PhRangeMax
    WHERE sa.Id = @SoilAnalysisId
    
    UNION ALL
    
    SELECT 
        'Mg' AS Nutrient,
        sa.Magnesium,
        ISNULL(sna.AvailabilityFactor, 0.70),
        sa.Magnesium * ISNULL(sna.AvailabilityFactor, 0.70)
    FROM dbo.SoilAnalysis sa
    LEFT JOIN dbo.SoilNutrientAvailability sna 
        ON sna.Nutrient = 'Mg' 
        AND @Ph BETWEEN sna.PhRangeMin AND sna.PhRangeMax
    WHERE sa.Id = @SoilAnalysisId;
END;
GO

-- ============================================================================
-- STORED PROCEDURE: Determine Soil Texture Class
-- Automatically classifies soil based on sand/silt/clay percentages
-- ============================================================================
CREATE PROCEDURE dbo.sp_DetermineSoilTextureClass
    @SandPercent DECIMAL(5,2),
    @SiltPercent DECIMAL(5,2),
    @ClayPercent DECIMAL(5,2),
    @TextureClass NVARCHAR(50) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Validate percentages sum to ~100
    IF ABS((@SandPercent + @SiltPercent + @ClayPercent) - 100) > 2
    BEGIN
        SET @TextureClass = 'Invalid - Percentages do not sum to 100';
        RETURN;
    END;
    
    -- Determine texture class using USDA soil triangle
    SELECT TOP 1 @TextureClass = TextureClassName
    FROM dbo.SoilTextureClass
    WHERE @SandPercent BETWEEN SandMin AND SandMax
      AND @SiltPercent BETWEEN SiltMin AND SiltMax
      AND @ClayPercent BETWEEN ClayMin AND ClayMax
      AND Active = 1
    ORDER BY 
        -- Prefer more specific matches
        ABS((@SandPercent - (SandMin + SandMax)/2)) + 
        ABS((@SiltPercent - (SiltMin + SiltMax)/2)) + 
        ABS((@ClayPercent - (ClayMin + ClayMax)/2));
    
    IF @TextureClass IS NULL
        SET @TextureClass = 'Unclassified';
END;
GO
```

---

## 📋 **STEP 5: Sample Data Insert** (15 minutes)

```sql
-- ============================================================================
-- SAMPLE DATA: Insert test soil analysis records
-- ============================================================================

-- Sample 1: Sandy Loam soil, good fertility
INSERT INTO dbo.SoilAnalysis (
    CropProductionId, SampleDate, LabName, LabReportNumber,
    SandPercent, SiltPercent, ClayPercent, TextureClass,
    PhSoil, ElectricalConductivity, OrganicMatterPercent, CationExchangeCapacity,
    NitrateNitrogen, Phosphorus, PhosphorusMethod, Potassium, Calcium, Magnesium, Sulfur,
    Iron, Manganese, Zinc, Copper, Boron,
    InterpretationLevel, Active, CreatedBy
)
VALUES (
    1, -- Replace with actual CropProductionId
    '2024-01-15',
    'AgriTest Laboratory',
    'AT-2024-0015',
    65.0, 25.0, 10.0, 'Sandy Loam',
    6.8, 0.8, 3.2, 12.5,
    25.0, 18.0, 'Mehlich3', 180.0, 1200.0, 150.0, 12.0,
    4.5, 8.0, 1.2, 0.8, 0.6,
    'Medium', 1, 1
);

-- Sample 2: Clay Loam soil, high CEC
INSERT INTO dbo.SoilAnalysis (
    CropProductionId, SampleDate, LabName, LabReportNumber,
    SandPercent, SiltPercent, ClayPercent, TextureClass,
    PhSoil, ElectricalConductivity, OrganicMatterPercent, CationExchangeCapacity,
    NitrateNitrogen, Phosphorus, PhosphorusMethod, Potassium, Calcium, Magnesium, Sulfur,
    InterpretationLevel, Active, CreatedBy
)
VALUES (
    1, -- Replace with actual CropProductionId
    '2024-01-20',
    'Soil Sciences Inc.',
    'SSI-2024-0042',
    32.0, 35.0, 33.0, 'Clay Loam',
    7.2, 1.2, 4.8, 24.0,
    18.0, 35.0, 'Olsen', 250.0, 2500.0, 380.0, 15.0,
    'High', 1, 1
);

GO
```

---

# PART 2: BACKEND API (.NET/C#)

## 📋 **STEP 6: Create Entity Models** (30 minutes)

**File**: `AgriSmartAPI/Models/SoilAnalysis.cs`

```csharp
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmartAPI.Models
{
    /// <summary>
    /// Soil analysis laboratory test results
    /// </summary>
    [Table("SoilAnalysis")]
    public class SoilAnalysis
    {
        [Key]
        public int Id { get; set; }

        // Foreign Keys
        [Required]
        public int CropProductionId { get; set; }
        public int? AnalyticalEntityId { get; set; }

        // Metadata
        [Required]
        public DateTime SampleDate { get; set; }
        
        [MaxLength(100)]
        public string LabReportNumber { get; set; }
        
        [MaxLength(200)]
        public string LabName { get; set; }
        
        [MaxLength(50)]
        public string SampleDepth { get; set; }
        
        [MaxLength(200)]
        public string SampleLocation { get; set; }

        // Physical Properties - Texture
        [Range(0, 100)]
        public decimal? SandPercent { get; set; }
        
        [Range(0, 100)]
        public decimal? SiltPercent { get; set; }
        
        [Range(0, 100)]
        public decimal? ClayPercent { get; set; }
        
        [MaxLength(50)]
        public string TextureClass { get; set; }
        
        public decimal? BulkDensity { get; set; }

        // Chemical Properties - General
        [Range(3.0, 10.0)]
        public decimal? PhSoil { get; set; }
        
        public decimal? ElectricalConductivity { get; set; }
        
        [Range(0, 100)]
        public decimal? OrganicMatterPercent { get; set; }
        
        public decimal? CationExchangeCapacity { get; set; }

        // Macronutrients - Nitrogen (ppm)
        public decimal? NitrateNitrogen { get; set; }
        public decimal? AmmoniumNitrogen { get; set; }
        public decimal? TotalNitrogen { get; set; }

        // Macronutrients - Phosphorus (ppm)
        public decimal? Phosphorus { get; set; }
        
        [MaxLength(50)]
        public string PhosphorusMethod { get; set; }

        // Macronutrients - Others (ppm)
        public decimal? Potassium { get; set; }
        public decimal? Calcium { get; set; }
        public decimal? CalciumCarbonate { get; set; }
        public decimal? Magnesium { get; set; }
        public decimal? Sulfur { get; set; }

        // Secondary Nutrients (ppm)
        public decimal? Sodium { get; set; }
        public decimal? Chloride { get; set; }

        // Micronutrients (ppm)
        public decimal? Iron { get; set; }
        public decimal? Manganese { get; set; }
        public decimal? Zinc { get; set; }
        public decimal? Copper { get; set; }
        public decimal? Boron { get; set; }
        public decimal? Molybdenum { get; set; }

        // Ratios and Calculated Values
        public decimal? CaToMgRatio { get; set; }
        public decimal? MgToKRatio { get; set; }
        public decimal? BasePercentCa { get; set; }
        public decimal? BasePercentMg { get; set; }
        public decimal? BasePercentK { get; set; }
        public decimal? BasePercentNa { get; set; }
        
        [Range(0, 100)]
        public decimal? BaseSaturationPercent { get; set; }

        // Interpretation
        [MaxLength(50)]
        public string InterpretationLevel { get; set; }
        
        public string Recommendations { get; set; }
        public string Notes { get; set; }

        // System Fields
        [Required]
        public bool Active { get; set; } = true;
        
        [Required]
        public DateTime DateCreated { get; set; } = DateTime.Now;
        
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        // Navigation Properties
        [ForeignKey("CropProductionId")]
        public virtual CropProduction CropProduction { get; set; }
        
        [ForeignKey("AnalyticalEntityId")]
        public virtual AnalyticalEntity AnalyticalEntity { get; set; }
    }

    /// <summary>
    /// Soil texture classification reference data
    /// </summary>
    [Table("SoilTextureClass")]
    public class SoilTextureClass
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string TextureClassName { get; set; }

        // Texture Triangle Boundaries
        [Required]
        public decimal SandMin { get; set; }
        [Required]
        public decimal SandMax { get; set; }
        [Required]
        public decimal SiltMin { get; set; }
        [Required]
        public decimal SiltMax { get; set; }
        [Required]
        public decimal ClayMin { get; set; }
        [Required]
        public decimal ClayMax { get; set; }

        // Water Holding Characteristics
        public decimal? TypicalFieldCapacity { get; set; }
        public decimal? TypicalWiltingPoint { get; set; }
        public decimal? TypicalAvailableWater { get; set; }
        public decimal? TypicalSaturatedHydraulicConductivity { get; set; }

        // Management Characteristics
        [MaxLength(50)]
        public string DrainageClass { get; set; }
        
        [MaxLength(50)]
        public string WorkabilityClass { get; set; }
        
        [MaxLength(50)]
        public string ErosionSusceptibility { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        public bool Active { get; set; } = true;
    }

    /// <summary>
    /// Nutrient availability factors by pH range
    /// </summary>
    [Table("SoilNutrientAvailability")]
    public class SoilNutrientAvailability
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(20)]
        public string Nutrient { get; set; }

        [Required]
        public decimal PhRangeMin { get; set; }

        [Required]
        public decimal PhRangeMax { get; set; }

        [Required]
        [Range(0, 1)]
        public decimal AvailabilityFactor { get; set; }

        [MaxLength(200)]
        public string Description { get; set; }
    }
}
```

---

## 📋 **STEP 7: Create DTOs** (20 minutes)

**File**: `AgriSmartAPI/DTOs/SoilAnalysisDto.cs`

```csharp
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AgriSmartAPI.DTOs
{
    /// <summary>
    /// DTO for creating/updating soil analysis
    /// </summary>
    public class SoilAnalysisDto
    {
        public int? Id { get; set; }

        [Required]
        public int CropProductionId { get; set; }

        public int? AnalyticalEntityId { get; set; }

        [Required]
        public DateTime SampleDate { get; set; }

        public string LabReportNumber { get; set; }
        public string LabName { get; set; }
        public string SampleDepth { get; set; }
        public string SampleLocation { get; set; }

        // Texture
        [Range(0, 100)]
        public decimal? SandPercent { get; set; }
        
        [Range(0, 100)]
        public decimal? SiltPercent { get; set; }
        
        [Range(0, 100)]
        public decimal? ClayPercent { get; set; }

        public string TextureClass { get; set; }
        public decimal? BulkDensity { get; set; }

        // Chemical
        [Range(3.0, 10.0)]
        public decimal? PhSoil { get; set; }
        
        public decimal? ElectricalConductivity { get; set; }
        
        [Range(0, 100)]
        public decimal? OrganicMatterPercent { get; set; }
        
        public decimal? CationExchangeCapacity { get; set; }

        // Nutrients
        public decimal? NitrateNitrogen { get; set; }
        public decimal? AmmoniumNitrogen { get; set; }
        public decimal? TotalNitrogen { get; set; }
        public decimal? Phosphorus { get; set; }
        public string PhosphorusMethod { get; set; }
        public decimal? Potassium { get; set; }
        public decimal? Calcium { get; set; }
        public decimal? Magnesium { get; set; }
        public decimal? Sulfur { get; set; }
        public decimal? Sodium { get; set; }
        public decimal? Iron { get; set; }
        public decimal? Manganese { get; set; }
        public decimal? Zinc { get; set; }
        public decimal? Copper { get; set; }
        public decimal? Boron { get; set; }

        // Interpretation
        public string InterpretationLevel { get; set; }
        public string Recommendations { get; set; }
        public string Notes { get; set; }
    }

    /// <summary>
    /// DTO for returning soil analysis with calculated values
    /// </summary>
    public class SoilAnalysisResponseDto : SoilAnalysisDto
    {
        public DateTime DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public bool Active { get; set; }

        // Calculated properties
        public decimal? CaToMgRatio { get; set; }
        public decimal? MgToKRatio { get; set; }
        public decimal? BaseSaturationPercent { get; set; }

        // Texture classification info
        public SoilTextureInfo TextureInfo { get; set; }

        // Available nutrients (pH-adjusted)
        public Dictionary<string, AvailableNutrient> AvailableNutrients { get; set; }
    }

    /// <summary>
    /// Soil texture information
    /// </summary>
    public class SoilTextureInfo
    {
        public string TextureClassName { get; set; }
        public string Description { get; set; }
        public decimal? TypicalFieldCapacity { get; set; }
        public decimal? TypicalWiltingPoint { get; set; }
        public decimal? TypicalAvailableWater { get; set; }
        public string DrainageClass { get; set; }
        public string WorkabilityClass { get; set; }
    }

    /// <summary>
    /// Available nutrient calculation
    /// </summary>
    public class AvailableNutrient
    {
        public string Nutrient { get; set; }
        public decimal SoilTestValue { get; set; }
        public decimal AvailabilityFactor { get; set; }
        public decimal AvailableAmount { get; set; }
        public string Unit { get; set; } = "ppm";
    }
}
```

---

## 📋 **STEP 8: Create Repository** (30 minutes)

**File**: `AgriSmartAPI/Repositories/SoilAnalysisRepository.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using AgriSmartAPI.Data;
using AgriSmartAPI.Models;

namespace AgriSmartAPI.Repositories
{
    public interface ISoilAnalysisRepository
    {
        Task<List<SoilAnalysis>> GetByCropProductionIdAsync(int cropProductionId, bool includeInactive = false);
        Task<SoilAnalysis> GetByIdAsync(int id);
        Task<SoilAnalysis> CreateAsync(SoilAnalysis soilAnalysis);
        Task<SoilAnalysis> UpdateAsync(SoilAnalysis soilAnalysis);
        Task<bool> DeleteAsync(int id);
        Task<List<SoilTextureClass>> GetAllTextureClassesAsync();
        Task<Dictionary<string, decimal>> GetAvailableNutrientsAsync(int soilAnalysisId);
    }

    public class SoilAnalysisRepository : ISoilAnalysisRepository
    {
        private readonly ApplicationDbContext _context;

        public SoilAnalysisRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<SoilAnalysis>> GetByCropProductionIdAsync(
            int cropProductionId, 
            bool includeInactive = false)
        {
            var query = _context.SoilAnalyses
                .Include(s => s.CropProduction)
                .Include(s => s.AnalyticalEntity)
                .Where(s => s.CropProductionId == cropProductionId);

            if (!includeInactive)
            {
                query = query.Where(s => s.Active);
            }

            return await query
                .OrderByDescending(s => s.SampleDate)
                .ToListAsync();
        }

        public async Task<SoilAnalysis> GetByIdAsync(int id)
        {
            return await _context.SoilAnalyses
                .Include(s => s.CropProduction)
                .Include(s => s.AnalyticalEntity)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<SoilAnalysis> CreateAsync(SoilAnalysis soilAnalysis)
        {
            // Auto-calculate ratios if data available
            CalculateRatios(soilAnalysis);

            // Auto-determine texture class if percentages provided
            if (soilAnalysis.SandPercent.HasValue && 
                soilAnalysis.SiltPercent.HasValue && 
                soilAnalysis.ClayPercent.HasValue &&
                string.IsNullOrEmpty(soilAnalysis.TextureClass))
            {
                soilAnalysis.TextureClass = await DetermineTextureClassAsync(
                    soilAnalysis.SandPercent.Value,
                    soilAnalysis.SiltPercent.Value,
                    soilAnalysis.ClayPercent.Value
                );
            }

            soilAnalysis.DateCreated = DateTime.Now;
            _context.SoilAnalyses.Add(soilAnalysis);
            await _context.SaveChangesAsync();
            
            return soilAnalysis;
        }

        public async Task<SoilAnalysis> UpdateAsync(SoilAnalysis soilAnalysis)
        {
            var existing = await _context.SoilAnalyses.FindAsync(soilAnalysis.Id);
            if (existing == null)
            {
                throw new KeyNotFoundException($"SoilAnalysis with Id {soilAnalysis.Id} not found");
            }

            // Update properties
            _context.Entry(existing).CurrentValues.SetValues(soilAnalysis);
            
            // Recalculate ratios
            CalculateRatios(existing);
            
            existing.DateUpdated = DateTime.Now;
            await _context.SaveChangesAsync();
            
            return existing;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var soilAnalysis = await _context.SoilAnalyses.FindAsync(id);
            if (soilAnalysis == null)
            {
                return false;
            }

            // Soft delete
            soilAnalysis.Active = false;
            soilAnalysis.DateUpdated = DateTime.Now;
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<List<SoilTextureClass>> GetAllTextureClassesAsync()
        {
            return await _context.SoilTextureClasses
                .Where(t => t.Active)
                .OrderBy(t => t.TextureClassName)
                .ToListAsync();
        }

        public async Task<Dictionary<string, decimal>> GetAvailableNutrientsAsync(int soilAnalysisId)
        {
            var soilAnalysis = await GetByIdAsync(soilAnalysisId);
            if (soilAnalysis == null || !soilAnalysis.PhSoil.HasValue)
            {
                return new Dictionary<string, decimal>();
            }

            var ph = soilAnalysis.PhSoil.Value;
            var results = new Dictionary<string, decimal>();

            // Get availability factors for current pH
            var availabilityFactors = await _context.SoilNutrientAvailabilities
                .Where(sna => sna.PhRangeMin <= ph && ph <= sna.PhRangeMax)
                .ToListAsync();

            // Calculate available N
            if (soilAnalysis.TotalNitrogen.HasValue)
            {
                var nFactor = availabilityFactors.FirstOrDefault(a => a.Nutrient == "N")?.AvailabilityFactor ?? 0.60m;
                results["N"] = soilAnalysis.TotalNitrogen.Value * nFactor;
            }

            // Calculate available P
            if (soilAnalysis.Phosphorus.HasValue)
            {
                var pFactor = availabilityFactors.FirstOrDefault(a => a.Nutrient == "P")?.AvailabilityFactor ?? 0.25m;
                results["P"] = soilAnalysis.Phosphorus.Value * pFactor;
            }

            // Calculate available K
            if (soilAnalysis.Potassium.HasValue)
            {
                var kFactor = availabilityFactors.FirstOrDefault(a => a.Nutrient == "K")?.AvailabilityFactor ?? 0.80m;
                results["K"] = soilAnalysis.Potassium.Value * kFactor;
            }

            // Calculate available Ca
            if (soilAnalysis.Calcium.HasValue)
            {
                var caFactor = availabilityFactors.FirstOrDefault(a => a.Nutrient == "Ca")?.AvailabilityFactor ?? 0.85m;
                results["Ca"] = soilAnalysis.Calcium.Value * caFactor;
            }

            // Calculate available Mg
            if (soilAnalysis.Magnesium.HasValue)
            {
                var mgFactor = availabilityFactors.FirstOrDefault(a => a.Nutrient == "Mg")?.AvailabilityFactor ?? 0.70m;
                results["Mg"] = soilAnalysis.Magnesium.Value * mgFactor;
            }

            return results;
        }

        // Private helper methods
        private void CalculateRatios(SoilAnalysis sa)
        {
            // Ca:Mg ratio
            if (sa.Calcium.HasValue && sa.Magnesium.HasValue && sa.Magnesium.Value > 0)
            {
                sa.CaToMgRatio = sa.Calcium.Value / sa.Magnesium.Value;
            }

            // Mg:K ratio
            if (sa.Magnesium.HasValue && sa.Potassium.HasValue && sa.Potassium.Value > 0)
            {
                sa.MgToKRatio = sa.Magnesium.Value / sa.Potassium.Value;
            }

            // Base saturation percentages (if CEC available)
            if (sa.CationExchangeCapacity.HasValue && sa.CationExchangeCapacity.Value > 0)
            {
                var cec = sa.CationExchangeCapacity.Value;
                
                if (sa.Calcium.HasValue)
                    sa.BasePercentCa = (sa.Calcium.Value / cec) * 100;
                
                if (sa.Magnesium.HasValue)
                    sa.BasePercentMg = (sa.Magnesium.Value / cec) * 100;
                
                if (sa.Potassium.HasValue)
                    sa.BasePercentK = (sa.Potassium.Value / cec) * 100;
                
                if (sa.Sodium.HasValue)
                    sa.BasePercentNa = (sa.Sodium.Value / cec) * 100;

                // Total base saturation
                sa.BaseSaturationPercent = 
                    (sa.BasePercentCa ?? 0) +
                    (sa.BasePercentMg ?? 0) +
                    (sa.BasePercentK ?? 0) +
                    (sa.BasePercentNa ?? 0);
            }
        }

        private async Task<string> DetermineTextureClassAsync(
            decimal sand,
            decimal silt,
            decimal clay)
        {
            // Validate sum
            if (Math.Abs((sand + silt + clay) - 100) > 2)
            {
                return "Invalid";
            }

            var textureClass = await _context.SoilTextureClasses
                .Where(t => t.Active &&
                           sand >= t.SandMin && sand <= t.SandMax &&
                           silt >= t.SiltMin && silt <= t.SiltMax &&
                           clay >= t.ClayMin && clay <= t.ClayMax)
                .OrderBy(t => 
                    Math.Abs(sand - (t.SandMin + t.SandMax) / 2) +
                    Math.Abs(silt - (t.SiltMin + t.SiltMax) / 2) +
                    Math.Abs(clay - (t.ClayMin + t.ClayMax) / 2))
                .FirstOrDefaultAsync();

            return textureClass?.TextureClassName ?? "Unclassified";
        }
    }
}
```

---

## 📋 **STEP 9: Create Controller** (30 minutes)

**File**: `AgriSmartAPI/Controllers/SoilAnalysisController.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using AgriSmartAPI.DTOs;
using AgriSmartAPI.Services;

namespace AgriSmartAPI.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class SoilAnalysisController : ControllerBase
    {
        private readonly ISoilAnalysisService _soilAnalysisService;
        private readonly ILogger<SoilAnalysisController> _logger;

        public SoilAnalysisController(
            ISoilAnalysisService soilAnalysisService,
            ILogger<SoilAnalysisController> logger)
        {
            _soilAnalysisService = soilAnalysisService;
            _logger = logger;
        }

        /// <summary>
        /// Get all soil analyses for a crop production
        /// </summary>
        /// <param name="cropProductionId">Crop production ID</param>
        /// <param name="includeInactive">Include inactive records</param>
        /// <returns>List of soil analyses</returns>
        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<List<SoilAnalysisResponseDto>>), 200)]
        public async Task<IActionResult> GetByCropProduction(
            [FromQuery] int cropProductionId,
            [FromQuery] bool includeInactive = false)
        {
            try
            {
                var analyses = await _soilAnalysisService.GetByCropProductionIdAsync(
                    cropProductionId, 
                    includeInactive);

                return Ok(new ApiResponse<List<SoilAnalysisResponseDto>>
                {
                    Success = true,
                    Result = analyses,
                    Message = $"Found {analyses.Count} soil analysis records"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving soil analyses for crop production {CropProductionId}", 
                    cropProductionId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Get soil analysis by ID
        /// </summary
        >
        /// <param name="id">Soil analysis ID</param>
        /// <returns>Soil analysis details</returns>
        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SoilAnalysisResponseDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var analysis = await _soilAnalysisService.GetByIdAsync(id);
                
                if (analysis == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"Soil analysis with ID {id} not found"
                    });
                }

                return Ok(new ApiResponse<SoilAnalysisResponseDto>
                {
                    Success = true,
                    Result = analysis
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving soil analysis {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Create new soil analysis
        /// </summary>
        /// <param name="dto">Soil analysis data</param>
        /// <returns>Created soil analysis</returns>
        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<SoilAnalysisResponseDto>), 201)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] SoilAnalysisDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid data",
                        Exception = string.Join("; ", ModelState.Values
                            .SelectMany(v => v.Errors)
                            .Select(e => e.ErrorMessage))
                    });
                }

                var analysis = await _soilAnalysisService.CreateAsync(dto);

                return CreatedAtAction(
                    nameof(GetById),
                    new { id = analysis.Id },
                    new ApiResponse<SoilAnalysisResponseDto>
                    {
                        Success = true,
                        Result = analysis,
                        Message = "Soil analysis created successfully"
                    });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating soil analysis");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Update existing soil analysis
        /// </summary>
        /// <param name="id">Soil analysis ID</param>
        /// <param name="dto">Updated soil analysis data</param>
        /// <returns>Updated soil analysis</returns>
        [HttpPut("{id}")]
        [ProducesResponseType(typeof(ApiResponse<SoilAnalysisResponseDto>), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(int id, [FromBody] SoilAnalysisDto dto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid data"
                    });
                }

                dto.Id = id;
                var analysis = await _soilAnalysisService.UpdateAsync(dto);

                if (analysis == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"Soil analysis with ID {id} not found"
                    });
                }

                return Ok(new ApiResponse<SoilAnalysisResponseDto>
                {
                    Success = true,
                    Result = analysis,
                    Message = "Soil analysis updated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating soil analysis {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Delete (soft delete) soil analysis
        /// </summary>
        /// <param name="id">Soil analysis ID</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id}")]
        [ProducesResponseType(typeof(ApiResponse<object>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _soilAnalysisService.DeleteAsync(id);

                if (!result)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"Soil analysis with ID {id} not found"
                    });
                }

                return Ok(new ApiResponse<object>
                {
                    Success = true,
                    Message = "Soil analysis deleted successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting soil analysis {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Get all soil texture classes (reference data)
        /// </summary>
        /// <returns>List of soil texture classes</returns>
        [HttpGet("texture-classes")]
        [ProducesResponseType(typeof(ApiResponse<List<SoilTextureInfo>>), 200)]
        public async Task<IActionResult> GetTextureClasses()
        {
            try
            {
                var textureClasses = await _soilAnalysisService.GetAllTextureClassesAsync();

                return Ok(new ApiResponse<List<SoilTextureInfo>>
                {
                    Success = true,
                    Result = textureClasses
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving texture classes");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Calculate available nutrients based on soil analysis and pH
        /// </summary>
        /// <param name="id">Soil analysis ID</param>
        /// <returns>Available nutrient concentrations</returns>
        [HttpGet("{id}/available-nutrients")]
        [ProducesResponseType(typeof(ApiResponse<Dictionary<string, AvailableNutrient>>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetAvailableNutrients(int id)
        {
            try
            {
                var availableNutrients = await _soilAnalysisService.GetAvailableNutrientsAsync(id);

                if (availableNutrients == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"Soil analysis with ID {id} not found"
                    });
                }

                return Ok(new ApiResponse<Dictionary<string, AvailableNutrient>>
                {
                    Success = true,
                    Result = availableNutrients,
                    Message = "Available nutrients calculated successfully"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating available nutrients for soil analysis {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Get latest soil analysis for a crop production
        /// </summary>
        /// <param name="cropProductionId">Crop production ID</param>
        /// <returns>Most recent soil analysis</returns>
        [HttpGet("latest")]
        [ProducesResponseType(typeof(ApiResponse<SoilAnalysisResponseDto>), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetLatest([FromQuery] int cropProductionId)
        {
            try
            {
                var analysis = await _soilAnalysisService.GetLatestByCropProductionAsync(cropProductionId);

                if (analysis == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = $"No soil analysis found for crop production {cropProductionId}"
                    });
                }

                return Ok(new ApiResponse<SoilAnalysisResponseDto>
                {
                    Success = true,
                    Result = analysis
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving latest soil analysis for crop production {CropProductionId}", 
                    cropProductionId);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }

        /// <summary>
        /// Validate soil texture percentages
        /// </summary>
        /// <param name="sand">Sand percentage</param>
        /// <param name="silt">Silt percentage</param>
        /// <param name="clay">Clay percentage</param>
        /// <returns>Validation result with texture class</returns>
        [HttpGet("validate-texture")]
        [ProducesResponseType(typeof(ApiResponse<TextureValidationResult>), 200)]
        public async Task<IActionResult> ValidateTexture(
            [FromQuery] decimal sand,
            [FromQuery] decimal silt,
            [FromQuery] decimal clay)
        {
            try
            {
                var validation = await _soilAnalysisService.ValidateTextureAsync(sand, silt, clay);

                return Ok(new ApiResponse<TextureValidationResult>
                {
                    Success = validation.IsValid,
                    Result = validation,
                    Message = validation.IsValid ? "Valid texture percentages" : validation.ErrorMessage
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating texture");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Exception = ex.Message
                });
            }
        }
    }

    /// <summary>
    /// Texture validation result
    /// </summary>
    public class TextureValidationResult
    {
        public bool IsValid { get; set; }
        public string TextureClass { get; set; }
        public string ErrorMessage { get; set; }
        public SoilTextureInfo TextureInfo { get; set; }
    }

    /// <summary>
    /// Generic API response wrapper
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Result { get; set; }
        public string Message { get; set; }
        public string Exception { get; set; }
    }
}
```

---

## 📋 **STEP 10: Create Service Layer** (45 minutes)

**File**: `AgriSmartAPI/Services/SoilAnalysisService.cs`

```csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using AgriSmartAPI.DTOs;
using AgriSmartAPI.Models;
using AgriSmartAPI.Repositories;

namespace AgriSmartAPI.Services
{
    public interface ISoilAnalysisService
    {
        Task<List<SoilAnalysisResponseDto>> GetByCropProductionIdAsync(int cropProductionId, bool includeInactive = false);
        Task<SoilAnalysisResponseDto> GetByIdAsync(int id);
        Task<SoilAnalysisResponseDto> GetLatestByCropProductionAsync(int cropProductionId);
        Task<SoilAnalysisResponseDto> CreateAsync(SoilAnalysisDto dto);
        Task<SoilAnalysisResponseDto> UpdateAsync(SoilAnalysisDto dto);
        Task<bool> DeleteAsync(int id);
        Task<List<SoilTextureInfo>> GetAllTextureClassesAsync();
        Task<Dictionary<string, AvailableNutrient>> GetAvailableNutrientsAsync(int id);
        Task<TextureValidationResult> ValidateTextureAsync(decimal sand, decimal silt, decimal clay);
    }

    public class SoilAnalysisService : ISoilAnalysisService
    {
        private readonly ISoilAnalysisRepository _repository;
        private readonly IMapper _mapper;
        private readonly ILogger<SoilAnalysisService> _logger;

        public SoilAnalysisService(
            ISoilAnalysisRepository repository,
            IMapper mapper,
            ILogger<SoilAnalysisService> logger)
        {
            _repository = repository;
            _mapper = mapper;
            _logger = logger;
        }

        public async Task<List<SoilAnalysisResponseDto>> GetByCropProductionIdAsync(
            int cropProductionId, 
            bool includeInactive = false)
        {
            var analyses = await _repository.GetByCropProductionIdAsync(cropProductionId, includeInactive);
            var dtos = new List<SoilAnalysisResponseDto>();

            foreach (var analysis in analyses)
            {
                var dto = await MapToResponseDtoAsync(analysis);
                dtos.Add(dto);
            }

            return dtos;
        }

        public async Task<SoilAnalysisResponseDto> GetByIdAsync(int id)
        {
            var analysis = await _repository.GetByIdAsync(id);
            if (analysis == null) return null;

            return await MapToResponseDtoAsync(analysis);
        }

        public async Task<SoilAnalysisResponseDto> GetLatestByCropProductionAsync(int cropProductionId)
        {
            var analyses = await _repository.GetByCropProductionIdAsync(cropProductionId, false);
            var latest = analyses.OrderByDescending(a => a.SampleDate).FirstOrDefault();

            if (latest == null) return null;

            return await MapToResponseDtoAsync(latest);
        }

        public async Task<SoilAnalysisResponseDto> CreateAsync(SoilAnalysisDto dto)
        {
            var soilAnalysis = _mapper.Map<SoilAnalysis>(dto);
            
            var created = await _repository.CreateAsync(soilAnalysis);
            
            return await MapToResponseDtoAsync(created);
        }

        public async Task<SoilAnalysisResponseDto> UpdateAsync(SoilAnalysisDto dto)
        {
            if (!dto.Id.HasValue)
            {
                throw new ArgumentException("Id is required for update");
            }

            var soilAnalysis = _mapper.Map<SoilAnalysis>(dto);
            soilAnalysis.Id = dto.Id.Value;
            
            var updated = await _repository.UpdateAsync(soilAnalysis);
            
            return await MapToResponseDtoAsync(updated);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            return await _repository.DeleteAsync(id);
        }

        public async Task<List<SoilTextureInfo>> GetAllTextureClassesAsync()
        {
            var textureClasses = await _repository.GetAllTextureClassesAsync();
            return _mapper.Map<List<SoilTextureInfo>>(textureClasses);
        }

        public async Task<Dictionary<string, AvailableNutrient>> GetAvailableNutrientsAsync(int id)
        {
            var analysis = await _repository.GetByIdAsync(id);
            if (analysis == null) return null;

            var availableNutrients = await _repository.GetAvailableNutrientsAsync(id);
            var result = new Dictionary<string, AvailableNutrient>();

            // Get soil test values and availability factors
            var nutrients = new Dictionary<string, decimal?>
            {
                { "N", analysis.TotalNitrogen },
                { "P", analysis.Phosphorus },
                { "K", analysis.Potassium },
                { "Ca", analysis.Calcium },
                { "Mg", analysis.Magnesium }
            };

            foreach (var nutrient in nutrients.Where(n => n.Value.HasValue))
            {
                if (availableNutrients.ContainsKey(nutrient.Key))
                {
                    var availableAmount = availableNutrients[nutrient.Key];
                    var factor = availableAmount / nutrient.Value.Value;

                    result[nutrient.Key] = new AvailableNutrient
                    {
                        Nutrient = nutrient.Key,
                        SoilTestValue = nutrient.Value.Value,
                        AvailabilityFactor = factor,
                        AvailableAmount = availableAmount,
                        Unit = "ppm"
                    };
                }
            }

            return result;
        }

        public async Task<TextureValidationResult> ValidateTextureAsync(
            decimal sand, 
            decimal silt, 
            decimal clay)
        {
            var result = new TextureValidationResult();

            // Check if percentages sum to ~100
            var sum = sand + silt + clay;
            if (Math.Abs(sum - 100) > 2)
            {
                result.IsValid = false;
                result.ErrorMessage = $"Texture percentages must sum to 100. Current sum: {sum:F1}%";
                return result;
            }

            // Check if each percentage is in valid range
            if (sand < 0 || sand > 100 || silt < 0 || silt > 100 || clay < 0 || clay > 100)
            {
                result.IsValid = false;
                result.ErrorMessage = "Each texture percentage must be between 0 and 100";
                return result;
            }

            // Determine texture class
            var textureClasses = await _repository.GetAllTextureClassesAsync();
            var matchingClass = textureClasses
                .Where(t => sand >= t.SandMin && sand <= t.SandMax &&
                           silt >= t.SiltMin && silt <= t.SiltMax &&
                           clay >= t.ClayMin && clay <= t.ClayMax)
                .OrderBy(t => 
                    Math.Abs(sand - (t.SandMin + t.SandMax) / 2) +
                    Math.Abs(silt - (t.SiltMin + t.SiltMax) / 2) +
                    Math.Abs(clay - (t.ClayMin + t.ClayMax) / 2))
                .FirstOrDefault();

            if (matchingClass != null)
            {
                result.IsValid = true;
                result.TextureClass = matchingClass.TextureClassName;
                result.TextureInfo = _mapper.Map<SoilTextureInfo>(matchingClass);
            }
            else
            {
                result.IsValid = true;
                result.TextureClass = "Unclassified";
                result.ErrorMessage = "Texture percentages are valid but do not match a standard USDA texture class";
            }

            return result;
        }

        // Private helper methods
        private async Task<SoilAnalysisResponseDto> MapToResponseDtoAsync(SoilAnalysis analysis)
        {
            var dto = _mapper.Map<SoilAnalysisResponseDto>(analysis);

            // Add texture info if texture class is set
            if (!string.IsNullOrEmpty(analysis.TextureClass))
            {
                var textureClasses = await _repository.GetAllTextureClassesAsync();
                var textureClass = textureClasses.FirstOrDefault(t => t.TextureClassName == analysis.TextureClass);
                if (textureClass != null)
                {
                    dto.TextureInfo = _mapper.Map<SoilTextureInfo>(textureClass);
                }
            }

            // Add available nutrients
            dto.AvailableNutrients = await GetAvailableNutrientsAsync(analysis.Id);

            return dto;
        }
    }
}
```

---

## 📋 **STEP 11: Configure AutoMapper** (15 minutes)

**File**: `AgriSmartAPI/Mappings/SoilAnalysisProfile.cs`

```csharp
using AutoMapper;
using AgriSmartAPI.DTOs;
using AgriSmartAPI.Models;

namespace AgriSmartAPI.Mappings
{
    public class SoilAnalysisProfile : Profile
    {
        public SoilAnalysisProfile()
        {
            // SoilAnalysis mappings
            CreateMap<SoilAnalysis, SoilAnalysisDto>().ReverseMap();
            
            CreateMap<SoilAnalysis, SoilAnalysisResponseDto>()
                .IncludeBase<SoilAnalysis, SoilAnalysisDto>();

            // SoilTextureClass mappings
            CreateMap<SoilTextureClass, SoilTextureInfo>()
                .ForMember(dest => dest.TextureClassName, opt => opt.MapFrom(src => src.TextureClassName))
                .ForMember(dest => dest.Description, opt => opt.MapFrom(src => src.Description))
                .ForMember(dest => dest.TypicalFieldCapacity, opt => opt.MapFrom(src => src.TypicalFieldCapacity))
                .ForMember(dest => dest.TypicalWiltingPoint, opt => opt.MapFrom(src => src.TypicalWiltingPoint))
                .ForMember(dest => dest.TypicalAvailableWater, opt => opt.MapFrom(src => src.TypicalAvailableWater))
                .ForMember(dest => dest.DrainageClass, opt => opt.MapFrom(src => src.DrainageClass))
                .ForMember(dest => dest.WorkabilityClass, opt => opt.MapFrom(src => src.WorkabilityClass));
        }
    }
}
```

---

## 📋 **STEP 12: Register Services in Startup** (10 minutes)

**File**: `AgriSmartAPI/Program.cs` or `Startup.cs`

```csharp
// Add to ConfigureServices or builder.Services

// Repositories
builder.Services.AddScoped<ISoilAnalysisRepository, SoilAnalysisRepository>();

// Services
builder.Services.AddScoped<ISoilAnalysisService, SoilAnalysisService>();

// AutoMapper
builder.Services.AddAutoMapper(typeof(SoilAnalysisProfile));

// Ensure DbContext is registered
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

---

# PART 3: FRONTEND - TASK 4.1

## 📋 **STEP 13: Create Angular Data Models** (20 minutes)

**File**: `src/app/features/soil-analysis/models/soil-analysis.models.ts`

```typescript
// ============================================================================
// SOIL ANALYSIS DATA MODELS
// ============================================================================

/**
 * Soil analysis entity from API
 */
export interface SoilAnalysis {
  id?: number;
  cropProductionId: number;
  analyticalEntityId?: number;
  
  // Metadata
  sampleDate: Date | string;
  labReportNumber?: string;
  labName?: string;
  sampleDepth?: string;
  sampleLocation?: string;
  
  // Physical Properties - Texture
  sandPercent?: number;
  siltPercent?: number;
  clayPercent?: number;
  textureClass?: string;
  bulkDensity?: number;
  
  // Chemical Properties
  phSoil?: number;
  electricalConductivity?: number;
  organicMatterPercent?: number;
  cationExchangeCapacity?: number;
  
  // Macronutrients - Nitrogen (ppm)
  nitrateNitrogen?: number;
  ammoniumNitrogen?: number;
  totalNitrogen?: number;
  
  // Macronutrients - Others (ppm)
  phosphorus?: number;
  phosphorusMethod?: string;
  potassium?: number;
  calcium?: number;
  calciumCarbonate?: number;
  magnesium?: number;
  sulfur?: number;
  
  // Secondary Nutrients (ppm)
  sodium?: number;
  chloride?: number;
  
  // Micronutrients (ppm)
  iron?: number;
  manganese?: number;
  zinc?: number;
  copper?: number;
  boron?: number;
  molybdenum?: number;
  
  // Calculated Ratios
  caToMgRatio?: number;
  mgToKRatio?: number;
  basePercentCa?: number;
  basePercentMg?: number;
  basePercentK?: number;
  basePercentNa?: number;
  baseSaturationPercent?: number;
  
  // Interpretation
  interpretationLevel?: 'Low' | 'Medium' | 'High' | 'Very High';
  recommendations?: string;
  notes?: string;
  
  // System fields
  active: boolean;
  dateCreated?: Date | string;
  dateUpdated?: Date | string;
}

/**
 * Soil analysis response with additional info
 */
export interface SoilAnalysisResponse extends SoilAnalysis {
  textureInfo?: SoilTextureInfo;
  availableNutrients?: { [key: string]: AvailableNutrient };
}

/**
 * Soil texture classification information
 */
export interface SoilTextureInfo {
  textureClassName: string;
  description: string;
  typicalFieldCapacity?: number;
  typicalWiltingPoint?: number;
  typicalAvailableWater?: number;
  drainageClass?: string;
  workabilityClass?: string;
}

/**
 * Available nutrient calculation
 */
export interface AvailableNutrient {
  nutrient: string;
  soilTestValue: number;
  availabilityFactor: number;
  availableAmount: number;
  unit: string;
}

/**
 * Texture validation result
 */
export interface TextureValidation {
  isValid: boolean;
  textureClass?: string;
  errorMessage?: string;
  textureInfo?: SoilTextureInfo;
}

/**
 * API Response wrapper
 */
export interface SoilAnalysisApiResponse {
  success: boolean;
  result: SoilAnalysisResponse | SoilAnalysisResponse[];
  message?: string;
  exception?: string;
}
```

---

## 📋 **STEP 14: Create Angular Service** (30 minutes)

**File**: `src/app/features/soil-analysis/services/soil-analysis.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import {
  SoilAnalysis,
  SoilAnalysisResponse,
  SoilAnalysisApiResponse,
  SoilTextureInfo,
  AvailableNutrient,
  TextureValidation
} from '../models/soil-analysis.models';

@Injectable({
  providedIn: 'root'
})
export class SoilAnalysisService {
  private readonly baseEndpoint = '/SoilAnalysis';

  constructor(
    private apiService: ApiService,
    private http: HttpClient
  ) { }

  /**
   * Get all soil analyses for a crop production
   */
  getByCropProduction(
    cropProductionId: number,
    includeInactive: boolean = false
  ): Observable<SoilAnalysisResponse[]> {
    let params = new HttpParams()
      .set('cropProductionId', cropProductionId.toString())
      .set('includeInactive', includeInactive.toString());

    return this.apiService.get<SoilAnalysisApiResponse>(this.baseEndpoint, params).pipe(
      map(response => {
        if (response.success && Array.isArray(response.result)) {
          return response.result;
        }
        return [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get soil analysis by ID
   */
  getById(id: number): Observable<SoilAnalysisResponse> {
    return this.apiService.get<SoilAnalysisApiResponse>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => {
        if (response.success && !Array.isArray(response.result)) {
          return response.result;
        }
        throw new Error('Soil analysis not found');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get latest soil analysis for a crop production
   */
  getLatest(cropProductionId: number): Observable<SoilAnalysisResponse | null> {
    let params = new HttpParams().set('cropProductionId', cropProductionId.toString());

    return this.apiService.get<SoilAnalysisApiResponse>(`${this.baseEndpoint}/latest`, params).pipe(
      map(response => {
        if (response.success && !Array.isArray(response.result)) {
          return response.result;
        }
        return null;
      }),
      catchError(error => {
        // Return null instead of error for not found cases
        if (error.status === 404) {
          return [null];
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Create new soil analysis
   */
  create(soilAnalysis: SoilAnalysis): Observable<SoilAnalysisResponse> {
    return this.apiService.post<SoilAnalysisApiResponse>(this.baseEndpoint, soilAnalysis).pipe(
      map(response => {
        if (response.success && !Array.isArray(response.result)) {
          return response.result;
        }
        throw new Error('Failed to create soil analysis');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update existing soil analysis
   */
  update(id: number, soilAnalysis: SoilAnalysis): Observable<SoilAnalysisResponse> {
    return this.apiService.put<SoilAnalysisApiResponse>(`${this.baseEndpoint}/${id}`, soilAnalysis).pipe(
      map(response => {
        if (response.success && !Array.isArray(response.result)) {
          return response.result;
        }
        throw new Error('Failed to update soil analysis');
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete soil analysis (soft delete)
   */
  delete(id: number): Observable<boolean> {
    return this.apiService.delete<SoilAnalysisApiResponse>(`${this.baseEndpoint}/${id}`).pipe(
      map(response => response.success),
      catchError(this.handleError)
    );
  }

  /**
   * Get all soil texture classes (reference data)
   */
  getTextureClasses(): Observable<SoilTextureInfo[]> {
    return this.apiService.get<any>(`${this.baseEndpoint}/texture-classes`).pipe(
      map(response => response.success ? response.result : []),
      catchError(this.handleError)
    );
  }

  /**
   * Get available nutrients for a soil analysis
   */
  getAvailableNutrients(id: number): Observable<{ [key: string]: AvailableNutrient }> {
    return this.apiService.get<any>(`${this.baseEn
    dpoint}/${id}/available-nutrients`).pipe(
      map(response => response.success ? response.result : {}),
      catchError(this.handleError)
    );
  }

  /**
   * Validate soil texture percentages
   */
  validateTexture(
    sand: number,
    silt: number,
    clay: number
  ): Observable<TextureValidation> {
    let params = new HttpParams()
      .set('sand', sand.toString())
      .set('silt', silt.toString())
      .set('clay', clay.toString());

    return this.apiService.get<any>(`${this.baseEndpoint}/validate-texture`, params).pipe(
      map(response => response.result),
      catchError(this.handleError)
    );
  }

  /**
   * Error handler
   */
  private handleError(error: any): Observable<never> {
    console.error('Soil Analysis Service Error:', error);
    let errorMessage = 'An error occurred';
    
    if (error.error?.exception) {
      errorMessage = error.error.exception;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
```

---

## 📋 **STEP 15: Create Soil Analysis Form Component** (1 hour)

**File**: `src/app/features/soil-analysis/components/soil-analysis-form/soil-analysis-form.component.ts`

```typescript
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SoilAnalysisService } from '../../services/soil-analysis.service';
import { 
  SoilAnalysis, 
  SoilAnalysisResponse, 
  SoilTextureInfo,
  TextureValidation 
} from '../../models/soil-analysis.models';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-soil-analysis-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './soil-analysis-form.component.html',
  styleUrls: ['./soil-analysis-form.component.css']
})
export class SoilAnalysisFormComponent implements OnInit {
  private destroy$ = new Subject<void>();
  
  @Input() cropProductionId!: number;
  @Input() existingSoilAnalysis?: SoilAnalysisResponse;
  @Input() mode: 'create' | 'edit' = 'create';
  
  @Output() saved = new EventEmitter<SoilAnalysisResponse>();
  @Output() cancelled = new EventEmitter<void>();
  
  soilAnalysisForm!: FormGroup;
  textureClasses: SoilTextureInfo[] = [];
  textureValidation: TextureValidation | null = null;
  
  isSubmitting = false;
  errorMessage = '';
  
  // Form sections visibility
  showPhysicalProperties = true;
  showChemicalProperties = true;
  showMacronutrients = true;
  showMicronutrients = false;
  showInterpretation = true;
  
  // Phosphorus extraction methods
  phosphorusMethods = ['Olsen', 'Bray1', 'Bray2', 'Mehlich3', 'Other'];
  
  // Interpretation levels
  interpretationLevels = ['Low', 'Medium', 'High', 'Very High'];

  constructor(
    private fb: FormBuilder,
    private soilAnalysisService: SoilAnalysisService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.loadTextureClasses();
    this.setupTextureValidation();
    
    if (this.existingSoilAnalysis) {
      this.populateForm(this.existingSoilAnalysis);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private initializeForm(): void {
    this.soilAnalysisForm = this.fb.group({
      // Metadata
      sampleDate: [new Date().toISOString().split('T')[0], Validators.required],
      labReportNumber: [''],
      labName: [''],
      sampleDepth: ['0-20cm'],
      sampleLocation: [''],
      
      // Physical Properties - Texture
      sandPercent: [null, [Validators.min(0), Validators.max(100)]],
      siltPercent: [null, [Validators.min(0), Validators.max(100)]],
      clayPercent: [null, [Validators.min(0), Validators.max(100)]],
      textureClass: [''],
      bulkDensity: [null, [Validators.min(0), Validators.max(3)]],
      
      // Chemical Properties
      phSoil: [null, [Validators.min(3), Validators.max(10)]],
      electricalConductivity: [null, [Validators.min(0)]],
      organicMatterPercent: [null, [Validators.min(0), Validators.max(100)]],
      cationExchangeCapacity: [null, [Validators.min(0)]],
      
      // Macronutrients - Nitrogen
      nitrateNitrogen: [null, [Validators.min(0)]],
      ammoniumNitrogen: [null, [Validators.min(0)]],
      totalNitrogen: [null, [Validators.min(0)]],
      
      // Macronutrients - Others
      phosphorus: [null, [Validators.min(0)]],
      phosphorusMethod: ['Mehlich3'],
      potassium: [null, [Validators.min(0)]],
      calcium: [null, [Validators.min(0)]],
      magnesium: [null, [Validators.min(0)]],
      sulfur: [null, [Validators.min(0)]],
      
      // Secondary Nutrients
      sodium: [null, [Validators.min(0)]],
      chloride: [null, [Validators.min(0)]],
      
      // Micronutrients
      iron: [null, [Validators.min(0)]],
      manganese: [null, [Validators.min(0)]],
      zinc: [null, [Validators.min(0)]],
      copper: [null, [Validators.min(0)]],
      boron: [null, [Validators.min(0)]],
      molybdenum: [null, [Validators.min(0)]],
      
      // Interpretation
      interpretationLevel: [''],
      recommendations: [''],
      notes: ['']
    });
  }

  private loadTextureClasses(): void {
    this.soilAnalysisService.getTextureClasses()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (classes) => {
          this.textureClasses = classes;
        },
        error: (error) => {
          console.error('Error loading texture classes:', error);
        }
      });
  }

  private setupTextureValidation(): void {
    // Watch for changes in texture percentages
    const sand$ = this.soilAnalysisForm.get('sandPercent')!.valueChanges;
    const silt$ = this.soilAnalysisForm.get('siltPercent')!.valueChanges;
    const clay$ = this.soilAnalysisForm.get('clayPercent')!.valueChanges;
    
    // Combine all three and debounce
    sand$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.validateTexture());
    
    silt$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.validateTexture());
    
    clay$.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => this.validateTexture());
  }

  private populateForm(soilAnalysis: SoilAnalysisResponse): void {
    // Convert date to YYYY-MM-DD format for input
    const sampleDate = new Date(soilAnalysis.sampleDate);
    const formattedDate = sampleDate.toISOString().split('T')[0];
    
    this.soilAnalysisForm.patchValue({
      ...soilAnalysis,
      sampleDate: formattedDate
    });
  }

  // ==========================================================================
  // TEXTURE VALIDATION
  // ==========================================================================

  private validateTexture(): void {
    const sand = this.soilAnalysisForm.get('sandPercent')?.value;
    const silt = this.soilAnalysisForm.get('siltPercent')?.value;
    const clay = this.soilAnalysisForm.get('clayPercent')?.value;
    
    if (sand !== null && silt !== null && clay !== null) {
      this.soilAnalysisService.validateTexture(sand, silt, clay)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (validation) => {
            this.textureValidation = validation;
            
            if (validation.isValid && validation.textureClass) {
              // Auto-fill texture class
              this.soilAnalysisForm.patchValue({
                textureClass: validation.textureClass
              }, { emitEvent: false });
            }
          },
          error: (error) => {
            console.error('Texture validation error:', error);
          }
        });
    }
  }

  // ==========================================================================
  // FORM ACTIONS
  // ==========================================================================

  onSubmit(): void {
    if (this.soilAnalysisForm.invalid) {
      this.markFormGroupTouched(this.soilAnalysisForm);
      this.errorMessage = 'Por favor complete los campos requeridos correctamente';
      return;
    }
    
    this.isSubmitting = true;
    this.errorMessage = '';
    
    const soilAnalysisData: SoilAnalysis = {
      ...this.soilAnalysisForm.value,
      cropProductionId: this.cropProductionId,
      active: true
    };
    
    const operation = this.mode === 'edit' && this.existingSoilAnalysis
      ? this.soilAnalysisService.update(this.existingSoilAnalysis.id!, soilAnalysisData)
      : this.soilAnalysisService.create(soilAnalysisData);
    
    operation
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.saved.emit(result);
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.message || 'Error al guardar análisis de suelo';
          console.error('Save error:', error);
        }
      });
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  onReset(): void {
    this.soilAnalysisForm.reset({
      sampleDate: new Date().toISOString().split('T')[0],
      phosphorusMethod: 'Mehlich3',
      sampleDepth: '0-20cm'
    });
    this.textureValidation = null;
  }

  // ==========================================================================
  // SECTION TOGGLES
  // ==========================================================================

  toggleSection(section: string): void {
    switch (section) {
      case 'physical':
        this.showPhysicalProperties = !this.showPhysicalProperties;
        break;
      case 'chemical':
        this.showChemicalProperties = !this.showChemicalProperties;
        break;
      case 'macro':
        this.showMacronutrients = !this.showMacronutrients;
        break;
      case 'micro':
        this.showMicronutrients = !this.showMicronutrients;
        break;
      case 'interpretation':
        this.showInterpretation = !this.showInterpretation;
        break;
    }
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.soilAnalysisForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.soilAnalysisForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return 'Este campo es requerido';
      if (field.errors['min']) return `Valor mínimo: ${field.errors['min'].min}`;
      if (field.errors['max']) return `Valor máximo: ${field.errors['max'].max}`;
    }
    return '';
  }

  get texturePercentageSum(): number {
    const sand = this.soilAnalysisForm.get('sandPercent')?.value || 0;
    const silt = this.soilAnalysisForm.get('siltPercent')?.value || 0;
    const clay = this.soilAnalysisForm.get('clayPercent')?.value || 0;
    return sand + silt + clay;
  }

  get isTextureSumValid(): boolean {
    const sum = this.texturePercentageSum;
    return sum === 0 || Math.abs(sum - 100) <= 2;
  }
}
```

---

**Continue to STEP 16 (Template) and STEP 17 (Styles)?**