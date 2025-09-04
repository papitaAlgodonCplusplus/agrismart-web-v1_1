using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetLicenseByIdResponse
    {
        public License? License { get; set; } = new License();
    }
}
