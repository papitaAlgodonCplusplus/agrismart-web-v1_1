namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record LoginResponse
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? UserName { get; set; }
        public int RoleId { get; set; }
        public string? Token { get; set; }
        public bool Active { get; set; }
    }
}
