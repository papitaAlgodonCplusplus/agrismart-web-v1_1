using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropByIdQuery : IRequest<Response<GetCropByIdResponse>>
    {
        public int Id { get; set; }
    }
}