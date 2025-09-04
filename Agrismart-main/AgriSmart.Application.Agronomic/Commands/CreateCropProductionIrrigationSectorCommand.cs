using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.SqlServer.Types;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCropProductionIrrigationSectorCommand : IRequest<Response<CreateCropProductionIrrigationSectorResponse>>
    {
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public string? Polygon { get; set; }
    }
}
