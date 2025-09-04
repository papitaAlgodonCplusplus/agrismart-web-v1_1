using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllContainerTypesResponse
    {
        public IReadOnlyList<ContainerType>? ContainerTypes { get; set; } = new List<ContainerType>();
    }
}