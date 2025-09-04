using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllUserStatusesResponse
    {
        public IReadOnlyList<UserStatus>? UserStatuses { get; set; } = new List<UserStatus>();
    }
}