using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetDropperResponse
    {
        public Dropper? Dropper { get; set; }
    }
}
