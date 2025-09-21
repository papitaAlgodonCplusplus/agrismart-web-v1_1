using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteMeasurementVariableCommand : IRequest<Response<DeleteMeasurementVariableResponse>>
    {
        public int Id { get; set; }
    }
}