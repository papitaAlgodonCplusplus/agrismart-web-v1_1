namespace AgriSmart.Core.Entities
{
    public class User : BaseEntity
    {
        public int ClientId { get; set; }
        public string? UserEmail { get; set; }
        public string? Password { get; set; }
        public int ProfileId { get; set; }
        public int UserStatusId { get; set; }
    }
}