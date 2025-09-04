using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetDropperResponse
    {
        public Dropper? Dropper { get; set; }
    }
}
