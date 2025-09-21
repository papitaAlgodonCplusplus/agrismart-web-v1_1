using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCatalogCommand : IRequest<Response<DeleteCatalogResponse>>
    {
        public int Id { get; set; }
    }
}