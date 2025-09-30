
using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public class GetAllNutrientRecipesResponse
    {
        public List<NutrientFormulationRecipeDto> Recipes { get; set; } = new();
    }
    
    public class NutrientFormulationRecipeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CropId { get; set; }
        public string? CropName { get; set; }
        public int CropPhaseId { get; set; }
        public string? CropPhaseName { get; set; }
        public double TargetPh { get; set; }
        public double TargetEc { get; set; }
        public double VolumeLiters { get; set; }
        public decimal? TotalCost { get; set; }
        public decimal? CostPerLiter { get; set; }
        public string? RecipeType { get; set; }
        public DateTime DateCreated { get; set; }
        public List<RecipeFertilizerDetailDto> Fertilizers { get; set; } = new();
    }
    
    public class RecipeFertilizerDetailDto
    {
        public int FertilizerId { get; set; }
        public string? FertilizerName { get; set; }
        public double ConcentrationGramsPerLiter { get; set; }
        public double? TotalGrams { get; set; }
        public decimal? TotalCost { get; set; }
    }
}
