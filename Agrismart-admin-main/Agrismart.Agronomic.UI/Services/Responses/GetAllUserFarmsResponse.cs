using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllUserFarmsResponse
    {
        public IReadOnlyList<UserFarm>? UserFarms { get; set; } = new List<UserFarm>();
    }
}