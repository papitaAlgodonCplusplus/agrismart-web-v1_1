using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteFertilizerInputCommandHandler : IRequestHandler<DeleteFertilizerInputCommand, Response<DeleteFertilizerInputResponse>>
    {
        private readonly IFertilizerInputCommandRepository _fertilizerInputCommandRepository;

        public DeleteFertilizerInputCommandHandler(IFertilizerInputCommandRepository fertilizerInputCommandRepository)
        {
            _fertilizerInputCommandRepository = fertilizerInputCommandRepository;
        }

        public async Task<Response<DeleteFertilizerInputResponse>> Handle(DeleteFertilizerInputCommand command, CancellationToken cancellationToken)
        {
            try
            {
                FertilizerInput deleteFertilizerInput = AgronomicMapper.Mapper.Map<FertilizerInput>(command);

                await _fertilizerInputCommandRepository.DeleteAsync(deleteFertilizerInput);

                return new Response<DeleteFertilizerInputResponse>(new DeleteFertilizerInputResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteFertilizerInputResponse>(ex);
            }
        }
    }
}