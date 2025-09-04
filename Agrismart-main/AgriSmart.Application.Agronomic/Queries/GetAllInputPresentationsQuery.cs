using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllInputPresentationsQuery : IRequest<Response<GetAllInputPresentationsResponse>>
    {
        public int CatalogId { get; set; }

        public bool IncludeInactives { get; set; }
    }
}