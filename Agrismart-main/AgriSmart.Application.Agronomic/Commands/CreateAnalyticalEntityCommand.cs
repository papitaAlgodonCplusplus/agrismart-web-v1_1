using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using System.Xml.Serialization;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateAnaliticalEntityCommand : IRequest<Response<CreateAnalyticalEntityResponse>>
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Script { get; set; }
        public int EntityType { get; set; }
        public bool Active { get; set; }    
    }
}
