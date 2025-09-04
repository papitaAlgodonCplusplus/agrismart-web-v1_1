using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateCatalogCommand : IRequest<Response<UpdateCatalogResponse>>
    {
        public int Id { get; set; }
        public int ClientId { get; set; }      
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}
