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
    public class DeleteFarmCommandHandler : IRequestHandler<DeleteFarmCommand, Response<DeleteFarmResponse>>
    {
        private readonly IFarmCommandRepository _farmCommandRepository;

        public DeleteFarmCommandHandler(IFarmCommandRepository farmCommandRepository)
        {
            _farmCommandRepository = farmCommandRepository;
        }

        public async Task<Response<DeleteFarmResponse>> Handle(DeleteFarmCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteFarmValidator validator = new DeleteFarmValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteFarmResponse>(new Exception(errors.ToString()));
                }

                Farm deleteFarm = AgronomicMapper.Mapper.Map<Farm>(command);

                await _farmCommandRepository.DeleteAsync(deleteFarm);

                return new Response<DeleteFarmResponse>(new DeleteFarmResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteFarmResponse>(ex);
            }
        }
    }
}