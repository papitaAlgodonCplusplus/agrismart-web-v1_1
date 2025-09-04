using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropPhaseOptimalByIdQuery : IRequest<Response<GetCropPhaseOptimalByIdResponse>>
    {
        public int Id { get; set; }
    }
}