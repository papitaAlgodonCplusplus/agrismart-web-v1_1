using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateDropperCommand : IRequest<Response<UpdateDropperResponse>>
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double FlowRate { get; set; }
        public bool Active { get; set; }
    }
}
