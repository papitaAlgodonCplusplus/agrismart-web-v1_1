using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetDropperResponse
    {
        public Dropper? Dropper { get; set; }
    }
}
