namespace Agrismart.Agronomic.UI.Services.Models
{
    public record User
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? UserEmail { get; set; }
        public string? Password { get; set; }
        public int ProfileId { get; set; }
        public int UserStatusId { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}