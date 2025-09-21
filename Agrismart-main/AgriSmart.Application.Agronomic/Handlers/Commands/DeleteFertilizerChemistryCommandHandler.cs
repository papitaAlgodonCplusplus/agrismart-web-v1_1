using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteFertilizerChemistryCommandHandler : IRequestHandler<DeleteFertilizerChemistryCommand, Response<DeleteFertilizerChemistryResponse>>
    {
        private readonly IFertilizerChemistryCommandRepository _fertilizerChemistryCommandRepository;

        public DeleteFertilizerChemistryCommandHandler(IFertilizerChemistryCommandRepository fertilizerChemistryCommandRepository)
        {
            _fertilizerChemistryCommandRepository = fertilizerChemistryCommandRepository;
        }

        public async Task<Response<DeleteFertilizerChemistryResponse>> Handle(DeleteFertilizerChemistryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                FertilizerChemistry deleteFertilizerChemistry = AgronomicMapper.Mapper.Map<FertilizerChemistry>(command);

                await _fertilizerChemistryCommandRepository.DeleteAsync(deleteFertilizerChemistry);

                return new Response<DeleteFertilizerChemistryResponse>(new DeleteFertilizerChemistryResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteFertilizerChemistryResponse>(ex);
            }
        }
    }
}