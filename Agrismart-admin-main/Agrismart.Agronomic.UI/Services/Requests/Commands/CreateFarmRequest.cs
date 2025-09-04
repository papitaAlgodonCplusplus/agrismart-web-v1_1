namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateFarmRequest
    {
        public int CompanyId { get; set; } = 0;
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int TimeZoneId { get; set; }
    }
}
