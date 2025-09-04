using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropProductionIrrigationSectorByIdQuery : IRequest<Response<GetCropProductionIrrigationSectorByIdResponse>>
    {
        public int Id { get; set; }
    }
}