using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetFertilizerByIdQuery : IRequest<Response<GetFertilizerByIdResponse>>
    {
        public int Id { get; set; }
    }
}