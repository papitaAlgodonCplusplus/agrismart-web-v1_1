using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateCalculationSettingCommand : IRequest<Response<UpdateCalculationSettingResponse>>
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double Value { get; set; }
        public bool Active { get; set; }
    }
}