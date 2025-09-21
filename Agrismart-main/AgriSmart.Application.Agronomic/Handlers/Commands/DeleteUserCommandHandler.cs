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
    public class DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, Response<DeleteUserResponse>>
    {
        private readonly IUserCommandRepository _userCommandRepository;

        public DeleteUserCommandHandler(IUserCommandRepository userCommandRepository)
        {
            _userCommandRepository = userCommandRepository;
        }

        public async Task<Response<DeleteUserResponse>> Handle(DeleteUserCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteUserValidator validator = new DeleteUserValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteUserResponse>(new Exception(errors.ToString()));
                }

                User deleteUser = AgronomicMapper.Mapper.Map<User>(command);

                await _userCommandRepository.DeleteAsync(deleteUser);

                return new Response<DeleteUserResponse>(new DeleteUserResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteUserResponse>(ex);
            }
        }
    }
}