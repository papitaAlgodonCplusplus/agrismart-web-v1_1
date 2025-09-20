
using System;
using System.Collections.Generic;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public class GetAllFertilizersResponse
    {
        public List<FertilizerDto> Fertilizers { get; set; } = new List<FertilizerDto>();
    }

    public class FertilizerDto
    {
        // Existing properties
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string Name { get; set; }
        public string? Manufacturer { get; set; }
        public bool IsLiquid { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        // NEW PROPERTIES ADDED

        // Basic Information
        public string? Brand { get; set; }
        public string? Description { get; set; }
        public string? Type { get; set; }
        public string? Formulation { get; set; }
        public decimal? Concentration { get; set; }
        public string? ConcentrationUnit { get; set; }
        public string? ApplicationMethod { get; set; }

        // NPK and Nutrient Percentages
        public decimal? NitrogenPercentage { get; set; }
        public decimal? PhosphorusPercentage { get; set; }
        public decimal? PotassiumPercentage { get; set; }
        public string? Micronutrients { get; set; }

        // Stock Management
        public decimal? CurrentStock { get; set; }
        public decimal? MinimumStock { get; set; }
        public string? StockUnit { get; set; }
        public decimal? PricePerUnit { get; set; }
        public string? Supplier { get; set; }

        // Storage and Application
        public DateTime? ExpirationDate { get; set; }
        public string? StorageInstructions { get; set; }
        public string? ApplicationInstructions { get; set; }

        // Chemical Analysis Parameters
        public decimal? Ca { get; set; }
        public decimal? K { get; set; }
        public decimal? Mg { get; set; }
        public decimal? Na { get; set; }
        public decimal? NH4 { get; set; }
        public decimal? N { get; set; }
        public decimal? SO4 { get; set; }
        public decimal? S { get; set; }
        public decimal? Cl { get; set; }
        public decimal? H2PO4 { get; set; }
        public decimal? P { get; set; }
        public decimal? HCO3 { get; set; }

        // Micronutrients Analysis
        public decimal? Fe { get; set; }
        public decimal? Mn { get; set; }
        public decimal? Zn { get; set; }
        public decimal? Cu { get; set; }
        public decimal? B { get; set; }
        public decimal? Mo { get; set; }

        // Solution Properties
        public decimal? TDS { get; set; }
        public decimal? EC { get; set; }
        public decimal? PH { get; set; }

        // Computed Properties
        public bool IsLowStock => CurrentStock.HasValue && MinimumStock.HasValue && CurrentStock <= MinimumStock;
        public bool IsExpired => ExpirationDate.HasValue && ExpirationDate < DateTime.UtcNow;
        public bool IsExpiringSoon => ExpirationDate.HasValue && 
                                     ExpirationDate < DateTime.UtcNow.AddDays(30) && 
                                     ExpirationDate >= DateTime.UtcNow;
        public decimal? TotalNPK => (NitrogenPercentage ?? 0) + (PhosphorusPercentage ?? 0) + (PotassiumPercentage ?? 0);
        public string NPKRatio => $"{NitrogenPercentage ?? 0:F1}-{PhosphorusPercentage ?? 0:F1}-{PotassiumPercentage ?? 0:F1}";
        public decimal? StockValue => (CurrentStock ?? 0) * (PricePerUnit ?? 0);
    }

    public class GetFertilizerByIdResponse
    {
        public FertilizerDto Fertilizer { get; set; }
    }
}