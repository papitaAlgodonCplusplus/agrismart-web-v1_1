namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record DeleteUserFarmResponse
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
    }
}