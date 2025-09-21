using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteFertilizerCommandHandler : IRequestHandler<DeleteFertilizerCommand, Response<DeleteFertilizerResponse>>
    {
        private readonly IFertilizerCommandRepository _fertilizerCommandRepository;

        public DeleteFertilizerCommandHandler(IFertilizerCommandRepository fertilizerCommandRepository)
        {
            _fertilizerCommandRepository = fertilizerCommandRepository;
        }

        public async Task<Response<DeleteFertilizerResponse>> Handle(DeleteFertilizerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteFertilizerValidator validator = new DeleteFertilizerValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteFertilizerResponse>(new Exception(errors.ToString()));
                }

                Fertilizer deleteFertilizer = AgronomicMapper.Mapper.Map<Fertilizer>(command);

                await _fertilizerCommandRepository.DeleteAsync(deleteFertilizer);

                return new Response<DeleteFertilizerResponse>(new DeleteFertilizerResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteFertilizerResponse>(ex);
            }
        }
    }
}