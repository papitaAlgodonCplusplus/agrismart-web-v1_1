namespace Agrismart.Agronomic.UI.Services.Models
{
    public record License
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? Key { get; set; }
        public DateTime ExpirationDate { get; set; }
        public int AllowedCompanies { get; set; }
        public int AllowedFarms { get; set; }
        public int AllowedUsers { get; set; }
        public int AllowedProductionUnits { get; set; }
        public int AllowedCropProductions { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}