
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    public class NutrientFormulationRecipe : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        // References
        public int CropId { get; set; }
        public int CropPhaseId { get; set; }
        public int? WaterSourceId { get; set; }
        public int CatalogId { get; set; } = -1;
        
        // Target Parameters
        public double TargetPh { get; set; }
        public double TargetEc { get; set; }
        public double VolumeLiters { get; set; } = 1000;
        
        // Target Nutrients (ppm or mg/L)
        public double TargetNitrogen { get; set; }
        public double TargetPhosphorus { get; set; }
        public double TargetPotassium { get; set; }
        public double? TargetCalcium { get; set; }
        public double? TargetMagnesium { get; set; }
        public double? TargetSulfur { get; set; }
        public double? TargetIron { get; set; }
        public double? TargetManganese { get; set; }
        public double? TargetZinc { get; set; }
        public double? TargetCopper { get; set; }
        public double? TargetBoron { get; set; }
        public double? TargetMolybdenum { get; set; }
        
        // Achieved Results
        public double? AchievedNitrogen { get; set; }
        public double? AchievedPhosphorus { get; set; }
        public double? AchievedPotassium { get; set; }
        public double? AchievedCalcium { get; set; }
        public double? AchievedMagnesium { get; set; }
        public double? AchievedSulfur { get; set; }
        public double? AchievedIron { get; set; }
        public double? AchievedManganese { get; set; }
        public double? AchievedZinc { get; set; }
        public double? AchievedCopper { get; set; }
        public double? AchievedBoron { get; set; }
        public double? AchievedMolybdenum { get; set; }
        
        // Cost Information
        public decimal? TotalCost { get; set; }
        public decimal? CostPerLiter { get; set; }
        
        // Additional Metadata
        public string? RecipeType { get; set; } // 'Simple' or 'Advanced'
        public string? Instructions { get; set; } // JSON array
        public string? Warnings { get; set; } // JSON array
        public string? Notes { get; set; }
        
        // Navigation Properties
        [NotMapped]
        public virtual Crop? Crop { get; set; }
        
        [NotMapped]
        public virtual CropPhase? CropPhase { get; set; }
        
        [NotMapped]
        public virtual ICollection<NutrientFormulationRecipeFertilizer> Fertilizers { get; set; } 
            = new List<NutrientFormulationRecipeFertilizer>();
    }
}