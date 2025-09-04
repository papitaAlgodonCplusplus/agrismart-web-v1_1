namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateUserFarmRequest
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
    }
}