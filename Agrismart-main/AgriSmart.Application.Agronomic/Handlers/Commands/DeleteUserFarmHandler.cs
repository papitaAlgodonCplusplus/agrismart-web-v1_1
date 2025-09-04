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
    public class DeleteUserFarmHandler : IRequestHandler<DeleteUserFarmCommand, Response<DeleteUserFarmResponse>>
    {
        private readonly IUserFarmCommandRepository _userFarmCommandRepository;

        public DeleteUserFarmHandler(IUserFarmCommandRepository userFarmCommandRepository)
        {
            _userFarmCommandRepository = userFarmCommandRepository;
        }

        public async Task<Response<DeleteUserFarmResponse>> Handle(DeleteUserFarmCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteUserFarmValidator validator = new DeleteUserFarmValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteUserFarmResponse>(new Exception(errors.ToString()));
                }

                UserFarm deleteUserFarm = AgronomicMapper.Mapper.Map<UserFarm>(command);

                await _userFarmCommandRepository.DeleteAsync(deleteUserFarm);

                return new Response<DeleteUserFarmResponse>(new DeleteUserFarmResponse());
            }
            catch (Exception ex)
            {
                return new Response<DeleteUserFarmResponse>(ex);
            }
        }
    }
}