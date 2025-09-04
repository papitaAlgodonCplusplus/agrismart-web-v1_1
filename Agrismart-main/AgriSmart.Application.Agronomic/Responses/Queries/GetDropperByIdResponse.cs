using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetDropperByIdResponse
    {
        public Dropper? Dropper { get; set; } = new Dropper();
    }
}
