using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCropProductionSpecsCommand : IRequest<Response<CreateCropProductionSpecsResponse>>
    {
        public string Name { get; set; }
        public string? Description { get; set; }
        public decimal BetweenRowDistance { get; set; }
        public decimal BetweenContainerDistance { get; set; }
        public decimal BetweenPlantDistance { get; set; }
        public decimal Area { get; set; }
        public decimal ContainerVolume { get; set; }
        public decimal AvailableWaterPercentage { get; set; }
        public int CreatedBy { get; set; }
    }
}
