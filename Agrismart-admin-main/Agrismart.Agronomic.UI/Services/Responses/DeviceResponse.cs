using System.Text.Json.Serialization;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record DeviceResponse
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool Active { get; set; }
    }
}
