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
    public class UpdateDropperHandler : IRequestHandler<UpdateDropperCommand, Response<UpdateDropperResponse>>
    {
        private readonly IDropperCommandRepository _dropperCommandRepository;
        private readonly IDropperQueryRepository _dropperQueryRepository;

        public UpdateDropperHandler(IDropperCommandRepository dropperCommandRepository, IDropperQueryRepository dropperQueryRepository)
        {
            _dropperCommandRepository = dropperCommandRepository;
            _dropperQueryRepository = dropperQueryRepository;
        }

        public async Task<Response<UpdateDropperResponse>> Handle(UpdateDropperCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateDropperValidator validator = new UpdateDropperValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateDropperResponse>(new Exception(errors.ToString()));
                }

                Dropper getResult = await _dropperQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.Active = command.Active;
                    getResult.FlowRate = command.FlowRate;
                    getResult.UpdatedBy = _dropperCommandRepository.GetSessionUserId();
                }

                Dropper updateDropperResult = await _dropperCommandRepository.UpdateAsync(getResult);

                if (updateDropperResult != null)
                {
                    UpdateDropperResponse updateDropperResponse = AgronomicMapper.Mapper.Map<UpdateDropperResponse>(updateDropperResult);

                    return new Response<UpdateDropperResponse>(updateDropperResponse);
                }
                return new Response<UpdateDropperResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateDropperResponse>(ex);
            }
        }
    }
}
