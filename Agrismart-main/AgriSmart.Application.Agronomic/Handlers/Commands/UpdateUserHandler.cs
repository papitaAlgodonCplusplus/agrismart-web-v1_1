using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateUserHandler : IRequestHandler<UpdateUserCommand, Response<UpdateUserResponse>>
    {
        private readonly IUserCommandRepository _userCommandRepository;
        private readonly IUserQueryRepository _userQueryRepository;

        public UpdateUserHandler(IUserCommandRepository userCommandRepository, IUserQueryRepository userQueryRepository)
        {
            _userCommandRepository = userCommandRepository;
            _userQueryRepository = userQueryRepository;
        }

        public async Task<Response<UpdateUserResponse>> Handle(UpdateUserCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateUserValidator validator = new UpdateUserValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateUserResponse>(new Exception(errors.ToString()));
                }

                User getResult = await _userQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.ProfileId = command.ProfileId;
                    getResult.ClientId = command.ClientId;
                    getResult.UserEmail = command.UserEmail;
                    getResult.Password = "123";
                    getResult.UserStatusId  = command.UserStatusId;
                }

                User updateUserResult = await _userCommandRepository.UpdateAsync(getResult);

                if (updateUserResult != null)
                {
                    UpdateUserResponse updateSensorResponse = new UpdateUserResponse()
                    {
                        Id = updateUserResult.Id,
                        ProfileId = updateUserResult.ProfileId,
                        ClientId = updateUserResult.ClientId,
                        UserEmail = updateUserResult.UserEmail,                        
                        UserStatusId = updateUserResult.UserStatusId
                    };

                    return new Response<UpdateUserResponse>(updateSensorResponse);
                }
                return new Response<UpdateUserResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateUserResponse>(ex);
            }
        }
    }
}