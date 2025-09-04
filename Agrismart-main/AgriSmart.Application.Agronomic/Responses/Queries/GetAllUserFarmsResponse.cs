using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllUserFarmsResponse
    {
        public IReadOnlyList<UserFarm>? UserFarms { get; set; } = new List<UserFarm>();
    }
}