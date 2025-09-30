
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateNutrientRecipeCommand : IRequest<Response<CreateNutrientRecipeResponse>>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CropId { get; set; }
        public int CropPhaseId { get; set; }
        public int? WaterSourceId { get; set; }
        public int CatalogId { get; set; } = -1;
        
        public double TargetPh { get; set; }
        public double TargetEc { get; set; }
        public double VolumeLiters { get; set; }
        
        public double TargetNitrogen { get; set; }
        public double TargetPhosphorus { get; set; }
        public double TargetPotassium { get; set; }
        public double? TargetCalcium { get; set; }
        public double? TargetMagnesium { get; set; }
        public double? TargetSulfur { get; set; }
        public double? TargetIron { get; set; }
        
        public double? AchievedNitrogen { get; set; }
        public double? AchievedPhosphorus { get; set; }
        public double? AchievedPotassium { get; set; }
        public double? AchievedCalcium { get; set; }
        public double? AchievedMagnesium { get; set; }
        public double? AchievedSulfur { get; set; }
        public double? AchievedIron { get; set; }
        
        public decimal? TotalCost { get; set; }
        public decimal? CostPerLiter { get; set; }
        public string? RecipeType { get; set; }
        public string? Instructions { get; set; }
        public string? Warnings { get; set; }
        public string? Notes { get; set; }
        
        public List<RecipeFertilizerDto>? Fertilizers { get; set; }
    }
    
    public class RecipeFertilizerDto
    {
        public int FertilizerId { get; set; }
        public double ConcentrationGramsPerLiter { get; set; }
        public double? TotalGrams { get; set; }
        public double? TotalKilograms { get; set; }
        public double? NitrogenContribution { get; set; }
        public double? PhosphorusContribution { get; set; }
        public double? PotassiumContribution { get; set; }
        public double? CalciumContribution { get; set; }
        public double? MagnesiumContribution { get; set; }
        public double? SulfurContribution { get; set; }
        public double? PercentageOfN { get; set; }
        public double? PercentageOfP { get; set; }
        public double? PercentageOfK { get; set; }
        public decimal? CostPerUnit { get; set; }
        public decimal? TotalCost { get; set; }
        public decimal? CostPortion { get; set; }
        public int? ApplicationOrder { get; set; }
        public string? ApplicationNotes { get; set; }
    }
}
