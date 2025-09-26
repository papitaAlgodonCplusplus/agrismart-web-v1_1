namespace AgriSmart.Core.Entities
{
    public class UserStatus
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? Active { get; set; }
    }
}