using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateKPIsCommand : IRequest<Response<CreateKPIsResponse>>
    {
        List<MeasurementKPI> Measurements { get; set; }
    }
}
