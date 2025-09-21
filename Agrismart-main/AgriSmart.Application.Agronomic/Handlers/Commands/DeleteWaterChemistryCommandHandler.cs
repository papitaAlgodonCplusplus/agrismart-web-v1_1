using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteWaterChemistryCommandHandler : IRequestHandler<DeleteWaterChemistryCommand, Response<DeleteWaterChemistryResponse>>
    {
        private readonly IWaterChemistryCommandRepository _waterChemistryCommandRepository;

        public DeleteWaterChemistryCommandHandler(IWaterChemistryCommandRepository waterChemistryCommandRepository)
        {
            _waterChemistryCommandRepository = waterChemistryCommandRepository;
        }

        public async Task<Response<DeleteWaterChemistryResponse>> Handle(DeleteWaterChemistryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                WaterChemistry deleteWaterChemistry = AgronomicMapper.Mapper.Map<WaterChemistry>(command);

                await _waterChemistryCommandRepository.DeleteAsync(deleteWaterChemistry);

                return new Response<DeleteWaterChemistryResponse>(new DeleteWaterChemistryResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteWaterChemistryResponse>(ex);
            }
        }
    }
}