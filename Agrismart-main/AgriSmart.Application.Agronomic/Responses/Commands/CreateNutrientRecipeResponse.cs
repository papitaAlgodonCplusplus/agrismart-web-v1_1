
namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public class CreateNutrientRecipeResponse
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Message { get; set; } = "Recipe created successfully";
    }
}