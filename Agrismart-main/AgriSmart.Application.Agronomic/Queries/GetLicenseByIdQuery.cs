using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetLicenseByIdQuery : IRequest<Response<GetLicenseByIdResponse>>
    {
        public int Id { get; set; }
    }
}