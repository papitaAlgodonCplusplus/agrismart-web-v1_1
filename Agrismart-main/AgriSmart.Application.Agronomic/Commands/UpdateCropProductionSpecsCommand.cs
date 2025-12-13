using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateCropProductionSpecsCommand : IRequest<Response<UpdateCropProductionSpecsResponse>>
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public decimal BetweenRowDistance { get; set; }
        public decimal BetweenContainerDistance { get; set; }
        public decimal BetweenPlantDistance { get; set; }
        public decimal Area { get; set; }
        public decimal ContainerVolume { get; set; }
        public decimal AvailableWaterPercentage { get; set; }
        public bool Active { get; set; }
        public int UpdatedBy { get; set; }
    }
}
