using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateInputPresentationCommand : IRequest<Response<CreateInputPresentationResponse>>
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public int MeasurementUnitId { get; set; }
        public string? Description { get; set; }
        public double Quantity { get; set; }
        public bool Active { get; set; }
    }
}
