using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetInputPresentationByIdQuery : IRequest<Response<GetInputPresentationByIdResponse>>
    {
        public int Id { get; set; }
    }
}