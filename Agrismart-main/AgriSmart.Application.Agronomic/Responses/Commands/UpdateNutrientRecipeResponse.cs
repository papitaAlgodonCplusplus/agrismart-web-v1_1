namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class UpdateNutrientRecipeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Message { get; set; } = "Recipe updated successfully";
    }
}