using AgriSmart.Tools.DataModels;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetGrowingMediumResponse
    {
        public GrowingMediumModel? GrowingMedium { get; set; } = new GrowingMediumModel();
    }
}
