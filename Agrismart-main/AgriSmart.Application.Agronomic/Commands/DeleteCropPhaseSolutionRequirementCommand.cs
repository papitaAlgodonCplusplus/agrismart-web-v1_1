using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCropPhaseSolutionRequirementCommand : IRequest<Response<DeleteCropPhaseSolutionRequirementResponse>>
    {
        public int Id { get; set; }
    }
}