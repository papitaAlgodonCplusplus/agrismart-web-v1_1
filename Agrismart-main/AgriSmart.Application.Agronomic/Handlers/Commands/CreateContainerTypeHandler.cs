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
    public class CreateContainerTypeHandler : IRequestHandler<CreateContainerTypeCommand, Response<CreateContainerTypeResponse>>
    {
        private readonly IContainerTypeCommandRepository _containerTypeCommandRepository;

        public CreateContainerTypeHandler(IContainerTypeCommandRepository containerTypeCommandRepository)
        {
            _containerTypeCommandRepository = containerTypeCommandRepository;
        }

        public async Task<Response<CreateContainerTypeResponse>> Handle(CreateContainerTypeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateContainerTypeValidator validator = new CreateContainerTypeValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateContainerTypeResponse>(new Exception(errors.ToString()));
                }

                ContainerType newContainerType = AgronomicMapper.Mapper.Map<ContainerType>(command);
                newContainerType.CreatedBy = _containerTypeCommandRepository.GetSessionUserId();
                newContainerType.Active = true;

                var result = await _containerTypeCommandRepository.CreateAsync(newContainerType);

                if (result != null)
                    return new Response<CreateContainerTypeResponse>(AgronomicMapper.Mapper.Map<CreateContainerTypeResponse>(result));

                return new Response<CreateContainerTypeResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateContainerTypeResponse>(ex);
            }
        }
    }
}
