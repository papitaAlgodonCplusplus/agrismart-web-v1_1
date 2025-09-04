using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropPhaseByIdQuery : IRequest<Response<GetCropPhaseByIdResponse>>
    {
        public int Id { get; set; }
    }
}