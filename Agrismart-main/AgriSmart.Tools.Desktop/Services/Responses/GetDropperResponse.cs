using AgriSmart.Tools.DataModels;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetDropperResponse
    {
        public DropperModel? Dropper { get; set; }
    }
}
