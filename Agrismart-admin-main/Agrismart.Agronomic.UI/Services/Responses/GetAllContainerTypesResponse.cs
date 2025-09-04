using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllContainerTypesResponse
    {
        public IReadOnlyList<ContainerType>? ContainerTypes { get; set; } = new List<ContainerType>();
    }
}