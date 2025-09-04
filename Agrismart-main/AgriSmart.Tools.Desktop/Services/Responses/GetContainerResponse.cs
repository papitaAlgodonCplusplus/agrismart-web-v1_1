using AgriSmart.Tools.DataModels;

namespace AgriSmart.AgronomicProcess.Models
{
    public record GetContainerResponse
    {
        public ContainerModel? Container { get; set; }
    }
}
