using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetMeasurementVariableByIdQuery : IRequest<Response<GetMeasurementVariableByIdResponse>>
    {
        public int Id { get; set; }
    }
}