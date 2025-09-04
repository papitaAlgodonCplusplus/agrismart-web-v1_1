using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllUserStatusesResponse
    {
        public IReadOnlyList<UserStatus>? UserStatuses { get; set; } = new List<UserStatus>();
    }
}