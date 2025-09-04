using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCatalogCommand : IRequest<Response<CreateCatalogResponse>>
    {
        public int ClientId { get; set; }
        public string? Name { get; set; }
    }
}
