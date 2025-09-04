namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateUserFarmResponse
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
    }
}
