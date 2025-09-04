using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public record ProcessCropProductionRawDataMeasurementsCommand : IRequest<Response<ProcessCropProductionRawDataMeasurementsResponse>>
    {
        public int CropProductionId { get; set; }
    }
}
