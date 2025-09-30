
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateNutrientRecipeCommand : IRequest<Response<UpdateNutrientRecipeResponse>>
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CropId { get; set; }
        public int CropPhaseId { get; set; }
        public int? WaterSourceId { get; set; }
        
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
}