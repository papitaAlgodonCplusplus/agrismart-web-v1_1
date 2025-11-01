namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    /// <summary>
    /// Response after successful registration
    /// </summary>
    public class RegisterResponse
    {
        public int UserId { get; set; }
        public string UserEmail { get; set; } = string.Empty;
        public int ClientId { get; set; }
        public int ProfileId { get; set; }
        public string Message { get; set; } = "User registered successfully";
    }
}