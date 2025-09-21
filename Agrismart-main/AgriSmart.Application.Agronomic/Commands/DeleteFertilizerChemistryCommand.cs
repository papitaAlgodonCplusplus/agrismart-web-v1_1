using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteFertilizerChemistryCommand : IRequest<Response<DeleteFertilizerChemistryResponse>>
    {
        public int Id { get; set; }
    }
}