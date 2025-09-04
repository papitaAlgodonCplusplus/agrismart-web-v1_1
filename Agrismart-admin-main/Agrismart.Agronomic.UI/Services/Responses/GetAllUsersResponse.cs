using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllUsersResponse
    {
        public IReadOnlyList<User>? Users { get; set; } = new List<User>();
    }
}