
namespace AgriSmart.Core.Entities
{
    public class NutrientFormulationRecipeFertilizer : BaseEntity
    {
        public int RecipeId { get; set; }
        public int FertilizerId { get; set; }
        
        // Dosage Information
        public double ConcentrationGramsPerLiter { get; set; }
        public double? TotalGrams { get; set; }
        public double? TotalKilograms { get; set; }
        
        // Nutrient Contributions
        public double? NitrogenContribution { get; set; }
        public double? PhosphorusContribution { get; set; }
        public double? PotassiumContribution { get; set; }
        public double? CalciumContribution { get; set; }
        public double? MagnesiumContribution { get; set; }
        public double? SulfurContribution { get; set; }
        
        // Percentages (from fertilizer composition)
        public double? PercentageOfN { get; set; }
        public double? PercentageOfP { get; set; }
        public double? PercentageOfK { get; set; }
        
        // Cost Information
        public decimal? CostPerUnit { get; set; }
        public decimal? TotalCost { get; set; }
        public decimal? CostPortion { get; set; }
        
        // Application Order
        public int? ApplicationOrder { get; set; }
        public string? ApplicationNotes { get; set; }

        // Status
        public bool? Active { get; set; }

        // Navigation Properties
        public virtual NutrientFormulationRecipe? Recipe { get; set; }
        public virtual Fertilizer? Fertilizer { get; set; }
    }
}
