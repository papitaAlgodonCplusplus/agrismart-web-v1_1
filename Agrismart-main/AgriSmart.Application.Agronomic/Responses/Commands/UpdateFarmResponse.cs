
// 5. Updated UpdateFarmResponse
// File: 
namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateFarmResponse
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int TimeZoneId { get; set; }
        
        // NEW PROPERTIES
        public string? Location { get; set; }
        public string? Address { get; set; }
        public decimal? Area { get; set; }
        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        public string? Climate { get; set; }
        public string? SoilType { get; set; }
        
        public bool? Active { get; set; }
    }
}
