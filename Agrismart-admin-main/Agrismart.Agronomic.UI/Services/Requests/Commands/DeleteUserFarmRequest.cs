namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record DeleteUserFarmRequest
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
    }
}