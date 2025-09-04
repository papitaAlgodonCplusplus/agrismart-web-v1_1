using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllUsersResponse
    {
        public IReadOnlyList<User>? Users { get; set; } = new List<User>();
    }
}