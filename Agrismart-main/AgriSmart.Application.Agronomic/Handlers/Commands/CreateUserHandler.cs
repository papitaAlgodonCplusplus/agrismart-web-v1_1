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
    public class CreateUserHandler : IRequestHandler<CreateUserCommand, Response<CreateUserResponse>>
    {
        private readonly IUserCommandRepository _userCommandRepository;

        public CreateUserHandler(IUserCommandRepository userCommandRepository)
        {
             _userCommandRepository = userCommandRepository;
        }

        public async Task<Response<CreateUserResponse>> Handle(CreateUserCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateUserValidator validator = new CreateUserValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateUserResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _userCommandRepository.GetSessionUserId();
                int sessionProfileId = _userCommandRepository.GetSessionProfileId();
                User newUser = AgronomicMapper.Mapper.Map<User>(command);

                newUser.CreatedBy = sessionUserId;
                newUser.UserStatusId = 1;
                newUser.Password = "123";

                var createUserResult = await _userCommandRepository.CreateAsync(newUser);

                if (createUserResult != null)
                {
                    CreateUserResponse createUserResponse = AgronomicMapper.Mapper.Map<CreateUserResponse>(createUserResult);

                    return new Response<CreateUserResponse>(createUserResponse);
                }
                return new Response<CreateUserResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateUserResponse>(ex);
            }
        }
    }
}