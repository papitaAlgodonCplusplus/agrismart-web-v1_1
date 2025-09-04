using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCalculationSettingCommand : IRequest<Response<CreateCalculationSettingResponse>>
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double Value { get; set; }
    }
}