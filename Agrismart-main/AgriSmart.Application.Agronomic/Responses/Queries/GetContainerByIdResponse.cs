using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetContainerByIdResponse
    {
        public Container? Container { get; set; } = new Container();
    }
}
