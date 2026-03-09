using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateContainerTypeHandler : IRequestHandler<UpdateContainerTypeCommand, Response<UpdateContainerTypeResponse>>
    {
        private readonly IContainerTypeCommandRepository _containerTypeCommandRepository;
        private readonly IContainerTypeQueryRepository _containerTypeQueryRepository;

        public UpdateContainerTypeHandler(IContainerTypeCommandRepository containerTypeCommandRepository, IContainerTypeQueryRepository containerTypeQueryRepository)
        {
            _containerTypeCommandRepository = containerTypeCommandRepository;
            _containerTypeQueryRepository = containerTypeQueryRepository;
        }

        public async Task<Response<UpdateContainerTypeResponse>> Handle(UpdateContainerTypeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateContainerTypeValidator validator = new UpdateContainerTypeValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateContainerTypeResponse>(new Exception(errors.ToString()));
                }

                var existing = await _containerTypeQueryRepository.GetByIdAsync(command.Id);
                if (existing == null)
                    return new Response<UpdateContainerTypeResponse>(new Exception("ContainerType not found"));

                existing.Name = command.Name;
                existing.FormulaType = command.FormulaType;
                existing.Active = command.Active;
                existing.UpdatedBy = _containerTypeCommandRepository.GetSessionUserId();

                var result = await _containerTypeCommandRepository.UpdateAsync(existing);

                if (result != null)
                    return new Response<UpdateContainerTypeResponse>(AgronomicMapper.Mapper.Map<UpdateContainerTypeResponse>(result));

                return new Response<UpdateContainerTypeResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateContainerTypeResponse>(ex);
            }
        }
    }
}
