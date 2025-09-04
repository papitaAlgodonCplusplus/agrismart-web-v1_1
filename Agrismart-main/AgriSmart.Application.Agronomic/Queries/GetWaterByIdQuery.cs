using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetWaterByIdQuery : IRequest<Response<GetWaterByIdResponse>>
    {
        public int Id { get; set; }
    }
}