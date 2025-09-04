using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllCropPhasesQuery : IRequest<Response<GetAllCropPhasesResponse>>
    {
        public int CropId { get; set; }
        public int CatalogId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}