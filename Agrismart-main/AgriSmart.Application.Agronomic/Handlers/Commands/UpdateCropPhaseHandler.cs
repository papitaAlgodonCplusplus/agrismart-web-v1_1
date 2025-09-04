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
    public class UpdateCropPhaseHandler : IRequestHandler<UpdateCropPhaseCommand, Response<UpdateCropPhaseResponse>>
    {
        private readonly ICropPhaseCommandRepository _cropPhaseCommandRepository;
        private readonly ICropPhaseQueryRepository _cropPhaseQueryRepository;

        public UpdateCropPhaseHandler(ICropPhaseCommandRepository cropPhaseCommandRepository, ICropPhaseQueryRepository cropPhaseQueryRepository)
        {
            _cropPhaseCommandRepository = cropPhaseCommandRepository;
            _cropPhaseQueryRepository = cropPhaseQueryRepository;
        }

        public async Task<Response<UpdateCropPhaseResponse>> Handle(UpdateCropPhaseCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCropPhaseValidator validator = new UpdateCropPhaseValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCropPhaseResponse>(new Exception(errors.ToString()));
                }

                CropPhase getResult = await _cropPhaseQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CropId = command.CropId;
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.Sequence = command.Sequence;
                    getResult.StartingWeek = command.StartingWeek;
                    getResult.EndingWeek = command.EndingWeek;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _cropPhaseCommandRepository.GetSessionUserId();
                }

                CropPhase updateCropPhaseResult = await _cropPhaseCommandRepository.UpdateAsync(getResult);

                if (updateCropPhaseResult != null)
                {
                    UpdateCropPhaseResponse updateCropPhaseResponse = AgronomicMapper.Mapper.Map<UpdateCropPhaseResponse>(updateCropPhaseResult);

                    return new Response<UpdateCropPhaseResponse>(updateCropPhaseResponse);
                }
                return new Response<UpdateCropPhaseResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropPhaseResponse>(ex);
            }
        }
    }
}
