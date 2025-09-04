namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record UserFarmResponse
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
    }
}