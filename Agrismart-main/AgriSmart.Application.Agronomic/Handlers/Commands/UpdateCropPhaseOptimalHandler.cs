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
    public class UpdateCropPhaseOptimalHandler : IRequestHandler<UpdateCropPhaseOptimalCommand, Response<UpdateCropPhaseOptimalResponse>>
    {
        private readonly ICropPhaseOptimalCommandRepository _cropPhaseOptimalCommandRepository;
        private readonly ICropPhaseOptimalQueryRepository _cropPhaseOptimalQueryRepository;

        public UpdateCropPhaseOptimalHandler(ICropPhaseOptimalCommandRepository cropPhaseOptimalCommandRepository, ICropPhaseOptimalQueryRepository cropPhaseOptimalQueryRepository)
        {
            _cropPhaseOptimalCommandRepository = cropPhaseOptimalCommandRepository;
            _cropPhaseOptimalQueryRepository = cropPhaseOptimalQueryRepository;
        }

        public async Task<Response<UpdateCropPhaseOptimalResponse>> Handle(UpdateCropPhaseOptimalCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCropPhaseOptimalValidator validator = new UpdateCropPhaseOptimalValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCropPhaseOptimalResponse>(new Exception(errors.ToString()));
                }

                CropPhaseOptimal getResult = await _cropPhaseOptimalQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.Value = command.Value;;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _cropPhaseOptimalCommandRepository.GetSessionUserId();
                }

                CropPhaseOptimal updateCropPhaseOptimalResult = await _cropPhaseOptimalCommandRepository.UpdateAsync(getResult);

                if (updateCropPhaseOptimalResult != null)
                {
                    UpdateCropPhaseOptimalResponse updateCropPhaseOptimalResponse = AgronomicMapper.Mapper.Map<UpdateCropPhaseOptimalResponse>(updateCropPhaseOptimalResult);

                    return new Response<UpdateCropPhaseOptimalResponse>(updateCropPhaseOptimalResponse);
                }
                return new Response<UpdateCropPhaseOptimalResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropPhaseOptimalResponse>(ex);
            }
        }
    }
}