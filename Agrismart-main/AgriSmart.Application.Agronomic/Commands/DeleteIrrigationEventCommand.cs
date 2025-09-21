using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteIrrigationEventCommand : IRequest<Response<DeleteIrrigationEventResponse>>
    {
        public int Id { get; set; }
    }
}