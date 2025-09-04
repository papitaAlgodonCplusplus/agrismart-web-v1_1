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
    public class CreateUserFarmHandler : IRequestHandler<CreateUserFarmCommand, Response<CreateUserFarmResponse>>
    {
        private readonly IUserFarmCommandRepository _userFarmCommandRepository;

        public CreateUserFarmHandler(IUserFarmCommandRepository userFarmCommandRepository)
        {
            _userFarmCommandRepository = userFarmCommandRepository;
        }

        public async Task<Response<CreateUserFarmResponse>> Handle(CreateUserFarmCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateUserFarmValidator validator = new CreateUserFarmValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateUserFarmResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _userFarmCommandRepository.GetSessionUserId();
                int sessionProfileId = _userFarmCommandRepository.GetSessionProfileId();
                UserFarm newUserFarm = AgronomicMapper.Mapper.Map<UserFarm>(command);

                newUserFarm.CreatedBy = sessionUserId;
                newUserFarm.Active = true;

                var createUserFarmResult = await _userFarmCommandRepository.CreateAsync(newUserFarm);

                if (createUserFarmResult != null)
                {
                    CreateUserFarmResponse createUserFarmResponse = AgronomicMapper.Mapper.Map<CreateUserFarmResponse>(createUserFarmResult);

                    return new Response<CreateUserFarmResponse>(createUserFarmResponse);
                }
                return new Response<CreateUserFarmResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateUserFarmResponse>(ex);
            }
        }
    }
}