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
    public class CreateContainerHandler : IRequestHandler<CreateContainerCommand, Response<CreateContainerResponse>>
    {
        private readonly IContainerCommandRepository _containerCommandRepository;

        public CreateContainerHandler(IContainerCommandRepository containerCommandRepository)
        {
            _containerCommandRepository = containerCommandRepository;            
        }

        public async Task<Response<CreateContainerResponse>> Handle(CreateContainerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateContainerValidator validator = new CreateContainerValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateContainerResponse>(new Exception(errors.ToString()));
                }

                Container newContainer = AgronomicMapper.Mapper.Map<Container>(command);

                newContainer.CreatedBy = _containerCommandRepository.GetSessionUserId();
                newContainer.Active = true;

                var createContainerResult = await _containerCommandRepository.CreateAsync(newContainer);

                if (createContainerResult != null)
                {
                    CreateContainerResponse createContainerResponse = AgronomicMapper.Mapper.Map<CreateContainerResponse>(createContainerResult);

                    return new Response<CreateContainerResponse>(createContainerResponse);
                }
                return new Response<CreateContainerResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateContainerResponse>(ex);
            }
        }
    }
}
