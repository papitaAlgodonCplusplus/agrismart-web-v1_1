using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllProfilesResponse
    {
        public IReadOnlyList<Profile>? Profiles { get; set; } = new List<Profile>();
    }
}