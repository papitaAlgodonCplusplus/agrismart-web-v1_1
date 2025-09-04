namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateUserPasswordResponse
    {
        public int Id { get; set; }
        public string? UserEmail { get; set; }
        public int UserStatusId { get; set; }
    }
}
