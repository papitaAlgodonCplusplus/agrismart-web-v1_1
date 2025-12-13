using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCropProductionSpecsByIdQuery : IRequest<Response<GetCropProductionSpecsByIdResponse>>
    {
        public int Id { get; set; }
    }
}
