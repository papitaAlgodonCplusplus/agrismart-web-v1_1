using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetContainerResponse
    {
        public Container? Container { get; set; }
    }
}
