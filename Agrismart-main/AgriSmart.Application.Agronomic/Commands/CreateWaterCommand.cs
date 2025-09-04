using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateWaterCommand : IRequest<Response<CreateWaterResponse>>
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
    }
}
