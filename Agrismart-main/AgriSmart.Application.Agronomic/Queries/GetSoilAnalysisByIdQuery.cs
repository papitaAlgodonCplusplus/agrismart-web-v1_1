using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetSoilAnalysisByIdQuery : IRequest<Response<GetSoilAnalysisByIdResponse>>
    {
        public int Id { get; set; }
    }
}
