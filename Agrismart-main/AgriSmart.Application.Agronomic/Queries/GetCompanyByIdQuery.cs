using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCompanyByIdQuery : IRequest<Response<GetCompanyByIdResponse>>
    {
        public int Id { get; set; }
    }
}