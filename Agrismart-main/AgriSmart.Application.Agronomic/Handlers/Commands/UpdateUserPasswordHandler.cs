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
    public class UpdateUserPasswordHandler : IRequestHandler<UpdateUserPasswordCommand, Response<UpdateUserPasswordResponse>>
    {
        private readonly IUserCommandRepository _userCommandRepository;
        private readonly IUserQueryRepository _userQueryRepository;

        public UpdateUserPasswordHandler(IUserCommandRepository userCommandRepository, IUserQueryRepository userQueryRepository)
        {
            _userCommandRepository = userCommandRepository;
            _userQueryRepository = userQueryRepository;
        }

        public async Task<Response<UpdateUserPasswordResponse>> Handle(UpdateUserPasswordCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateUserPasswordValidator validator = new UpdateUserPasswordValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateUserPasswordResponse>(new Exception(errors.ToString()));
                }

                User getResult = await _userQueryRepository.GetBySessionIdAsync();

                if (getResult != null && getResult.Password == command.CurrentPassword)
                {
                    getResult.Password = command.NewPassword;
                }
                else
                {
                    return new Response<UpdateUserPasswordResponse>(new Exception("Password could not be updated"));
                }

                User updateUserResult = await _userCommandRepository.UpdateAsync(getResult);

                if (updateUserResult != null)
                {
                    UpdateUserPasswordResponse updateUserPasswordResponse = new UpdateUserPasswordResponse()
                    {
                        Id = updateUserResult.Id,
                        UserEmail = updateUserResult.UserEmail,                        
                        UserStatusId = updateUserResult.UserStatusId
                    };

                    return new Response<UpdateUserPasswordResponse>(updateUserPasswordResponse);
                }
                return new Response<UpdateUserPasswordResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateUserPasswordResponse>(ex);
            }
        }
    }
}