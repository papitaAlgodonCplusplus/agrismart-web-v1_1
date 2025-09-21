using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCropPhaseOptimalCommand : IRequest<Response<DeleteCropPhaseOptimalResponse>>
    {
        public int Id { get; set; }
    }
}