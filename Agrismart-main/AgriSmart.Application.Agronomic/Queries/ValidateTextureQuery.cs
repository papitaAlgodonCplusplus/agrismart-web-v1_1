using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record ValidateTextureQuery : IRequest<Response<ValidateTextureResponse>>
    {
        public decimal Sand { get; set; }
        public decimal Silt { get; set; }
        public decimal Clay { get; set; }
    }
}
