using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropProductionByIdQuery : IRequest<Response<GetCropProductionByIdResponse>>
    {
        public int Id { get; set; }
    }
}