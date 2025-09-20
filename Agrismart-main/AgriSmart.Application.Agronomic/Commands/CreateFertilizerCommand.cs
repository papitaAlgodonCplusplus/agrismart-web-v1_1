// AgriSmart.Application.Agronomic/Commands/CreateFertilizerCommand.cs
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.ComponentModel.DataAnnotations;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateFertilizerCommand : IRequest<Response<CreateFertilizerResponse>>
    {
        // Existing properties
        [Required]
        public int CatalogId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; }
        
        [StringLength(200)]
        public string? Manufacturer { get; set; }
        
        public bool IsLiquid { get; set; }
        
        public bool Active { get; set; }

        // NEW PROPERTIES ADDED

        // Basic Information
        [StringLength(200)]
        public string? Brand { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [StringLength(100)]
        public string? Type { get; set; }
        
        [StringLength(200)]
        public string? Formulation { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? Concentration { get; set; }
        
        [StringLength(50)]
        public string? ConcentrationUnit { get; set; }
        
        [StringLength(100)]
        public string? ApplicationMethod { get; set; }

        // NPK and Nutrient Percentages
        [Range(0, 100)]
        public decimal? NitrogenPercentage { get; set; }
        
        [Range(0, 100)]
        public decimal? PhosphorusPercentage { get; set; }
        
        [Range(0, 100)]
        public decimal? PotassiumPercentage { get; set; }
        
        [StringLength(500)]
        public string? Micronutrients { get; set; }

        // Stock Management
        [Range(0, double.MaxValue)]
        public decimal? CurrentStock { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? MinimumStock { get; set; }
        
        [StringLength(50)]
        public string? StockUnit { get; set; }
        
        [Range(0, double.MaxValue)]
        public decimal? PricePerUnit { get; set; }
        
        [StringLength(200)]
        public string? Supplier { get; set; }

        // Storage and Application
        public DateTime? ExpirationDate { get; set; }
        
        [StringLength(1000)]
        public string? StorageInstructions { get; set; }
        
        [StringLength(1000)]
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
        
        [Range(0, 14)]
        public decimal? PH { get; set; }
    }
}