using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetFarmByIdResponse
    {
        public Farm? Farm { get; set; } = new Farm();
    }
}
