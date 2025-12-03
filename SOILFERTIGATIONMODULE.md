# 📘 **DETAILED IMPLEMENTATION GUIDE: WEEK 4 - SOIL FERTIGATION MODULE**
 

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

## 📋 **STEP 16: Create Soil Analysis Form Template** (1 hour)

**File**: `src/app/features/soil-analysis/components/soil-analysis-form/soil-analysis-form.component.html`

```html
<!-- ============================================================================
     SOIL ANALYSIS FORM COMPONENT TEMPLATE
     ============================================================================ -->

<div class="soil-analysis-form">

  <!-- FORM HEADER -->
  <div class="form-header">
    <h3 class="form-title">
      <i class="bi bi-clipboard-data"></i>
      {{ mode === 'edit' ? 'Editar' : 'Nuevo' }} Análisis de Suelo
    </h3>
    <p class="form-subtitle">
      Ingrese los resultados del análisis de laboratorio
    </p>
  </div>

  <!-- ERROR MESSAGE -->
  <div class="alert alert-danger" *ngIf="errorMessage">
    <i class="bi bi-exclamation-triangle"></i>
    {{ errorMessage }}
  </div>

  <!-- MAIN FORM -->
  <form [formGroup]="soilAnalysisForm" (ngSubmit)="onSubmit()">

    <!-- ==================== METADATA SECTION ==================== -->
    <div class="form-section">
      <div class="section-header">
        <h5 class="section-title">
          <i class="bi bi-info-circle"></i>
          Información General
        </h5>
      </div>
      <div class="section-content">
        <div class="row g-3">
          
          <!-- Sample Date -->
          <div class="col-md-3">
            <label class="form-label required">Fecha de Muestreo</label>
            <input 
              type="date" 
              class="form-control"
              formControlName="sampleDate"
              [class.is-invalid]="isFieldInvalid('sampleDate')">
            <div class="invalid-feedback" *ngIf="isFieldInvalid('sampleDate')">
              {{ getFieldError('sampleDate') }}
            </div>
          </div>

          <!-- Lab Report Number -->
          <div class="col-md-3">
            <label class="form-label">Número de Reporte</label>
            <input 
              type="text" 
              class="form-control"
              formControlName="labReportNumber"
              placeholder="Ej: AT-2024-0015">
          </div>

          <!-- Lab Name -->
          <div class="col-md-6">
            <label class="form-label">Laboratorio</label>
            <input 
              type="text" 
              class="form-control"
              formControlName="labName"
              placeholder="Nombre del laboratorio">
          </div>

          <!-- Sample Depth -->
          <div class="col-md-6">
            <label class="form-label">Profundidad de Muestra</label>
            <input 
              type="text" 
              class="form-control"
              formControlName="sampleDepth"
              placeholder="Ej: 0-20cm">
          </div>

          <!-- Sample Location -->
          <div class="col-md-6">
            <label class="form-label">Ubicación de Muestra</label>
            <input 
              type="text" 
              class="form-control"
              formControlName="sampleLocation"
              placeholder="Sector, coordenadas GPS, etc.">
          </div>

        </div>
      </div>
    </div>

    <!-- ==================== PHYSICAL PROPERTIES SECTION ==================== -->
    <div class="form-section">
      <div class="section-header clickable" (click)="toggleSection('physical')">
        <h5 class="section-title">
          <i class="bi" [ngClass]="showPhysicalProperties ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          <i class="bi bi-layers"></i>
          Propiedades Físicas - Textura
        </h5>
      </div>
      <div class="section-content" *ngIf="showPhysicalProperties">
        <div class="row g-3">
          
          <!-- Sand Percent -->
          <div class="col-md-4">
            <label class="form-label">Arena (%)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="sandPercent"
              min="0"
              max="100"
              step="0.1"
              [class.is-invalid]="isFieldInvalid('sandPercent')">
            <div class="invalid-feedback" *ngIf="isFieldInvalid('sandPercent')">
              {{ getFieldError('sandPercent') }}
            </div>
          </div>

          <!-- Silt Percent -->
          <div class="col-md-4">
            <label class="form-label">Limo (%)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="siltPercent"
              min="0"
              max="100"
              step="0.1"
              [class.is-invalid]="isFieldInvalid('siltPercent')">
            <div class="invalid-feedback" *ngIf="isFieldInvalid('siltPercent')">
              {{ getFieldError('siltPercent') }}
            </div>
          </div>

          <!-- Clay Percent -->
          <div class="col-md-4">
            <label class="form-label">Arcilla (%)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="clayPercent"
              min="0"
              max="100"
              step="0.1"
              [class.is-invalid]="isFieldInvalid('clayPercent')">
            <div class="invalid-feedback" *ngIf="isFieldInvalid('clayPercent')">
              {{ getFieldError('clayPercent') }}
            </div>
          </div>

          <!-- Texture Validation Status -->
          <div class="col-12" *ngIf="texturePercentageSum > 0">
            <div 
              class="alert"
              [class.alert-success]="isTextureSumValid && textureValidation?.isValid"
              [class.alert-warning]="!isTextureSumValid"
              [class.alert-info]="isTextureSumValid && !textureValidation?.isValid">
              <div class="d-flex align-items-center gap-2">
                <i class="bi" [ngClass]="{
                  'bi-check-circle-fill': isTextureSumValid && textureValidation?.isValid,
                  'bi-exclamation-triangle-fill': !isTextureSumValid,
                  'bi-info-circle-fill': isTextureSumValid && !textureValidation?.isValid
                }"></i>
                <div>
                  <strong>Suma: {{ texturePercentageSum | number:'1.1-1' }}%</strong>
                  <span *ngIf="textureValidation?.textureClass"> - 
                    Clase: <strong>{{ textureValidation.textureClass }}</strong>
                  </span>
                  <div *ngIf="!isTextureSumValid" class="small">
                    ⚠️ Los porcentajes deben sumar 100% (±2%)
                  </div>
                  <div *ngIf="textureValidation?.textureInfo" class="small mt-1">
                    {{ textureValidation.textureInfo.description }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Texture Class (auto-filled or manual) -->
          <div class="col-md-6">
            <label class="form-label">Clase Textural</label>
            <select class="form-select" formControlName="textureClass">
              <option value="">Seleccione clase textural</option>
              <option *ngFor="let tc of textureClasses" [value]="tc.textureClassName">
                {{ tc.textureClassName }}
              </option>
            </select>
          </div>

          <!-- Bulk Density -->
          <div class="col-md-6">
            <label class="form-label">
              Densidad Aparente (g/cm³)
              <i class="bi bi-question-circle text-muted" 
                 title="Típicamente 1.0-1.6 g/cm³"></i>
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="bulkDensity"
              min="0"
              max="3"
              step="0.01"
              placeholder="Ej: 1.35">
          </div>

        </div>
      </div>
    </div>

    <!-- ==================== CHEMICAL PROPERTIES SECTION ==================== -->
    <div class="form-section">
      <div class="section-header clickable" (click)="toggleSection('chemical')">
        <h5 class="section-title">
          <i class="bi" [ngClass]="showChemicalProperties ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          <i class="bi bi-droplet-half"></i>
          Propiedades Químicas Generales
        </h5>
      </div>
      <div class="section-content" *ngIf="showChemicalProperties">
        <div class="row g-3">
          
          <!-- pH -->
          <div class="col-md-3">
            <label class="form-label">
              pH del Suelo
              <i class="bi bi-question-circle text-muted" 
                 title="Rango típico: 4.0-9.0. Óptimo: 6.0-7.0"></i>
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="phSoil"
              min="3"
              max="10"
              step="0.1"
              placeholder="Ej: 6.8"
              [class.is-invalid]="isFieldInvalid('phSoil')">
            <div class="invalid-feedback" *ngIf="isFieldInvalid('phSoil')">
              {{ getFieldError('phSoil') }}
            </div>
          </div>

          <!-- EC -->
          <div class="col-md-3">
            <label class="form-label">
              CE (dS/m)
              <i class="bi bi-question-circle text-muted" 
                 title="Conductividad Eléctrica - Indicador de salinidad"></i>
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="electricalConductivity"
              min="0"
              step="0.1"
              placeholder="Ej: 0.8">
          </div>

          <!-- Organic Matter -->
          <div class="col-md-3">
            <label class="form-label">
              Materia Orgánica (%)
              <i class="bi bi-question-circle text-muted" 
                 title="Rango típico: 1-10%"></i>
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="organicMatterPercent"
              min="0"
              max="100"
              step="0.1"
              placeholder="Ej: 3.2"
              [class.is-invalid]="isFieldInvalid('organicMatterPercent')">
          </div>

          <!-- CEC -->
          <div class="col-md-3">
            <label class="form-label">
              CIC (meq/100g)
              <i class="bi bi-question-circle text-muted" 
                 title="Capacidad de Intercambio Catiónico"></i>
            </label>
            <input 
              type="number" 
              class="form-control"
              formControlName="cationExchangeCapacity"
              min="0"
              step="0.1"
              placeholder="Ej: 12.5">
          </div>

        </div>
      </div>
    </div>

    <!-- ==================== MACRONUTRIENTS SECTION ==================== -->
    <div class="form-section">
      <div class="section-header clickable" (click)="toggleSection('macro')">
        <h5 class="section-title">
          <i class="bi" [ngClass]="showMacronutrients ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          <i class="bi bi-graph-up"></i>
          Macronutrientes (ppm o mg/kg)
        </h5>
      </div>
      <div class="section-content" *ngIf="showMacronutrients">
        
        <!-- Nitrogen -->
        <div class="nutrient-group">
          <h6 class="nutrient-group-title">Nitrógeno</h6>
          <div class="row g-3">
            <div class="col-md-4">
              <label class="form-label">NO₃-N (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="nitrateNitrogen"
                min="0"
                step="0.1"
                placeholder="Nitrato">
            </div>
            <div class="col-md-4">
              <label class="form-label">NH₄-N (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="ammoniumNitrogen"
                min="0"
                step="0.1"
                placeholder="Amonio">
            </div>
            <div class="col-md-4">
              <label class="form-label">N Total (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="totalNitrogen"
                min="0"
                step="0.1"
                placeholder="Total">
            </div>
          </div>
        </div>

        <!-- Phosphorus -->
        <div class="nutrient-group">
          <h6 class="nutrient-group-title">Fósforo</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">P (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="phosphorus"
                min="0"
                step="0.1"
                placeholder="Fósforo disponible">
            </div>
            <div class="col-md-6">
              <label class="form-label">Método de Extracción</label>
              <select class="form-select" formControlName="phosphorusMethod">
                <option *ngFor="let method of phosphorusMethods" [value]="method">
                  {{ method }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Other Macronutrients -->
        <div class="nutrient-group">
          <h6 class="nutrient-group-title">Otros Macronutrientes</h6>
          <div class="row g-3">
            <div class="col-md-3">
              <label class="form-label">K (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="potassium"
                min="0"
                step="0.1"
                placeholder="Potasio">
            </div>
            <div class="col-md-3">
              <label class="form-label">Ca (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="calcium"
                min="0"
                step="0.1"
                placeholder="Calcio">
            </div>
            <div class="col-md-3">
              <label class="form-label">Mg (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="magnesium"
                min="0"
                step="0.1"
                placeholder="Magnesio">
            </div>
            <div class="col-md-3">
              <label class="form-label">S (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="sulfur"
                min="0"
                step="0.1"
                placeholder="Azufre">
            </div>
          </div>
        </div>

        <!-- Secondary Nutrients -->
        <div class="nutrient-group">
          <h6 class="nutrient-group-title">Nutrientes Secundarios</h6>
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label">Na (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="sodium"
                min="0"
                step="0.1"
                placeholder="Sodio">
            </div>
            <div class="col-md-6">
              <label class="form-label">Cl (ppm)</label>
              <input 
                type="number" 
                class="form-control"
                formControlName="chloride"
                min="0"
                step="0.1"
                placeholder="Cloruro">
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ==================== MICRONUTRIENTS SECTION ==================== -->
    <div class="form-section">
      <div class="section-header clickable" (click)="toggleSection('micro')">
        <h5 class="section-title">
          <i class="bi" [ngClass]="showMicronutrients ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          <i class="bi bi-plus-circle"></i>
          Micronutrientes (ppm o mg/kg)
        </h5>
      </div>
      <div class="section-content" *ngIf="showMicronutrients">
        <div class="row g-3">
          
          <div class="col-md-4">
            <label class="form-label">Fe (ppm)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="iron"
              min="0"
              step="0.1"
              placeholder="Hierro">
          </div>

          <div class="col-md-4">
            <label class="form-label">Mn (ppm)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="manganese"
              min="0"
              step="0.1"
              placeholder="Manganeso">
          </div>

          <div class="col-md-4">
            <label class="form-label">Zn (ppm)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="zinc"
              min="0"
              step="0.1"
              placeholder="Zinc">
          </div>

          <div class="col-md-4">
            <label class="form-label">Cu (ppm)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="copper"
              min="0"
              step="0.1"
              placeholder="Cobre">
          </div>

          <div class="col-md-4">
            <label class="form-label">B (ppm)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="boron"
              min="0"
              step="0.1"
              placeholder="Boro">
          </div>

          <div class="col-md-4">
            <label class="form-label">Mo (ppm)</label>
            <input 
              type="number" 
              class="form-control"
              formControlName="molybdenum"
              min="0"
              step="0.01"
              placeholder="Molibdeno">
          </div>

        </div>
      </div>
    </div>

    <!-- ==================== INTERPRETATION SECTION ==================== -->
    <div class="form-section">
      <div class="section-header clickable" (click)="toggleSection('interpretation')">
        <h5 class="section-title">
          <i class="bi" [ngClass]="showInterpretation ? 'bi-chevron-down' : 'bi-chevron-right'"></i>
          <i class="bi bi-file-earmark-text"></i>
          Interpretación y Recomendaciones
        </h5>
      </div>
      <div class="section-content" *ngIf="showInterpretation">
        <div class="row g-3">
          
          <!-- Interpretation Level -->
          <div class="col-md-12">
            <label class="form-label">Nivel de Interpretación</label>
            <select class="form-select" formControlName="interpretationLevel">
              <option value="">Seleccione nivel</option>
              <option *ngFor="let level of interpretationLevels" [value]="level">
                {{ level }}
              </option>
            </select>
          </div>

          <!-- Recommendations -->
          <div class="col-md-12">
            <label class="form-label">Recomendaciones del Laboratorio</label>
            <textarea 
              class="form-control"
              formControlName="recommendations"
              rows="4"
              placeholder="Ingrese las recomendaciones del laboratorio..."></textarea>
          </div>

          <!-- Notes -->
          <div class="col-md-12">
            <label class="form-label">Notas Adicionales</label>
            <textarea 
              class="form-control"
              formControlName="notes"
              rows="3"
              placeholder="Observaciones, condiciones especiales, etc..."></textarea>
          </div>

        </div>
      </div>
    </div>

    <!-- ==================== FORM ACTIONS ==================== -->
    <div class="form-actions">
      <button 
        type="button" 
        class="btn btn-outline-secondary"
        (click)="onCancel()"
        [disabled]="isSubmitting">
        <i class="bi bi-x-circle"></i>
        Cancelar
      </button>

      <button 
        type="button" 
        class="btn btn-outline-warning"
        (click)="onReset()"
        [disabled]="isSubmitting">
        <i class="bi bi-arrow-counterclockwise"></i>
        Restablecer
      </button>

      <button 
        type="submit" 
        class="btn btn-primary"
        [disabled]="isSubmitting || soilAnalysisForm.invalid">
        <span *ngIf="!isSubmitting">
          <i class="bi bi-check-circle"></i>
          {{ mode === 'edit' ? 'Actualizar' : 'Guardar' }} Análisis
        </span>
        <span *ngIf="isSubmitting">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Guardando...
        </span>
      </button>
    </div>

  </form>

</div>
```

---

## 📋 **STEP 17: Create Component Styles** (30 minutes)

**File**: `src/app/features/soil-analysis/components/soil-analysis-form/soil-analysis-form.component.css`

```css
/* ============================================================================
   SOIL ANALYSIS FORM STYLES
   ============================================================================ */

/* Main Container */
.soil-analysis-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Form Header */
.form-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 3px solid #007bff;
}

.form-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #343a40;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.form-title i {
  color: #007bff;
}

.form-subtitle {
  color: #6c757d;
  margin: 0;
  font-size: 1rem;
}

/* Form Sections */
.form-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.form-section:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #dee2e6;
}

.section-header.clickable {
  cursor: pointer;
  user-select: none;
}

.section-header.clickable:hover .section-title {
  color: #007bff;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #343a40;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
}

.section-content {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 2000px;
  }
}

/* Nutrient Groups */
.nutrient-group {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  border-left: 4px solid #007bff;
}

.nutrient-group-title {
  font-size: 1rem;
  font-weight: 600;
  color: #495057;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Form Controls */
.form-label {
  font-weight: 600;
  color: #495057;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.form-label.required::after {
  content: '*';
  color: #dc3545;
  margin-left: 0.25rem;
}

.form-label i.bi-question-circle {
  font-size: 0.875rem;
  cursor: help;
}

.form-control,
.form-select {
  border: 2px solid #ced4da;
  border-radius: 6px;
  padding: 0.625rem 0.75rem;
  transition: all 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-control.is-invalid,
.form-select.is-invalid {
  border-color: #dc3545;
}

.invalid-feedback {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

/* Texture Validation Alert */
.alert {
  border-radius: 8px;
  border: none;
  padding: 1rem;
}

.alert i {
  font-size: 1.25rem;
}

.alert-success {
  background: #d4edda;
  color: #155724;
}

.alert-warning {
  background: #fff3cd;
  color: #856404;
}

.alert-info {
  background: #d1ecf1;
  color: #0c5460;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #dee2e6;
}

.form-actions .btn {
  padding: 0.75rem 2rem;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.form-actions .btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.form-actions .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .soil-analysis-form {
    padding: 1rem;
  }

  .form-title {
    font-size: 1.5rem;
  }

  .section-title {
    font-size: 1.1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions .btn {
    width: 100%;
  }

  .nutrient-group {
    padding: 0.75rem;
  }
}

/* Print Styles */
@media print {
  .form-actions,
  .section-header.clickable i.bi-chevron-down,
  .section-header.clickable i.bi-chevron-right {
    display: none;
  }

  .form-section {
    page-break-inside: avoid;
  }
}
```

---

## ⏱️ **TOTAL TIME BREAKDOWN FOR WEEK 4**

| Phase | Step | Time | Cumulative |
|-------|------|------|------------|
| **SQL** | 1. SoilAnalysis Table | 30 min | 30 min |
| | 2. Texture Reference Table | 15 min | 45 min |
| | 3. Nutrient Availability Table | 15 min | 1h |
| | 4. Stored Procedures | 30 min | **1h 30min** |
| | 5. Sample Data | 15 min | **1h 45min** |
| **Backend** | 6. Entity Models | 30 min | 2h 15min |
| | 7. DTOs | 20 min | 2h 35min |
| | 8. Repository | 30 min | 3h 5min |
| | 9. Controller | 30 min | 3h 35min |
| | 10. Service Layer | 45 min | 4h 20min |
| | 11. AutoMapper | 15 min | 4h 35min |
| | 12. Startup Config | 10 min | **4h 45min** |
| **Frontend** | 13. Angular Models | 20 min | 5h 5min |
| | 14. Angular Service | 30