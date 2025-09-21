using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCropPhaseCommand : IRequest<Response<DeleteCropPhaseResponse>>
    {
        public int Id { get; set; }
    }
}