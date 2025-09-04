using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;


namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateCropProductionIrrigationSectorCommand : IRequest<Response<UpdateCropProductionIrrigationSectorResponse>>
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public string? Polygon { get; set; }
        public bool Active { get; set; }
    }
}
