namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record UserResponse
    {
        public int Id { get; set; }
        public int ProfileId { get; set; }
        public int ClientId { get; set; }
        public string? UserEmail { get; set; }
        public int UserStatusId { get; set; }
    }
}