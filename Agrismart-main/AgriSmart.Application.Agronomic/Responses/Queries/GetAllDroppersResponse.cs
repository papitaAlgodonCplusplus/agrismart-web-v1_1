using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllDroppersResponse
    {
        public IReadOnlyList<Dropper>? Droppers { get; set; } = new List<Dropper>();
    }
}
