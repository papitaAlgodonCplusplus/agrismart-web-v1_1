using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetContainerResponse
    {
        public Container? Container { get; set; }
    }
}
