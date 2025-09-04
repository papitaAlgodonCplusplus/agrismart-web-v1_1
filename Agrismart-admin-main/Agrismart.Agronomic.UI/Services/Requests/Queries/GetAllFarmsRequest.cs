namespace Agrismart.Agronomic.UI.Services.Requests.Queries
{
    public record GetAllFarmsRequest
    {
        public int ClientId { get; set; }
        public int CompanyId { get; set; }
        public int UserId { get; set; } 
        public bool IncludeInactives { get; set; }
    }
}
