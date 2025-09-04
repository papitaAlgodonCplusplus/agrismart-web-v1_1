using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateContainerHandler : IRequestHandler<UpdateContainerCommand, Response<UpdateContainerResponse>>
    {
        private readonly IContainerCommandRepository _containerCommandRepository;
        private readonly IContainerQueryRepository _containerQueryRepository;

        public UpdateContainerHandler(IContainerCommandRepository containerCommandRepository, IContainerQueryRepository containerQueryRepository)
        {
            _containerCommandRepository = containerCommandRepository;
            _containerQueryRepository = containerQueryRepository;
        }

        public async Task<Response<UpdateContainerResponse>> Handle(UpdateContainerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateContainerValidator validator = new UpdateContainerValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateContainerResponse>(new Exception(errors.ToString()));
                }

                Container getResult = await _containerQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.ContainerTypeId = command.ContainerTypeId;
                    getResult.Height = command.Height;
                    getResult.Width = command.Width;
                    getResult.Length = command.Length;
                    getResult.LowerDiameter = command.LowerDiameter;
                    getResult.UpperDiameter = command.UpperDiameter;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _containerCommandRepository.GetSessionUserId();
                }

                Container updateContainerResult = await _containerCommandRepository.UpdateAsync(getResult);

                if (updateContainerResult != null)
                {
                    UpdateContainerResponse updateContainerResponse = AgronomicMapper.Mapper.Map<UpdateContainerResponse>(updateContainerResult);

                    return new Response<UpdateContainerResponse>(updateContainerResponse);
                }
                return new Response<UpdateContainerResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateContainerResponse>(ex);
            }
        }
    }
}
