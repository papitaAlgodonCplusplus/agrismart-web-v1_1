using Agrismart.Agronomic.UI.Services.Models;


namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllProfilesResponse
    {
        public IReadOnlyList<Profile>? Profiles { get; set; } = new List<Profile>();
    }
}