using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetFertilizerInputByIdQuery : IRequest<Response<GetFertilizerInputByIdResponse>>
    {
        public int Id { get; set; }
    }
}