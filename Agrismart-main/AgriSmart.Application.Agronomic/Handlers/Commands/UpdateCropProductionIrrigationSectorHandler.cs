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
    public class UpdateCropProductionIrrigationSectorHandler : IRequestHandler<UpdateCropProductionIrrigationSectorCommand, Response<UpdateCropProductionIrrigationSectorResponse>>
    {
        private readonly ICropProductionIrrigationSectorCommandRepository _cropProductionIrrigationSectorCommandRepository;
        private readonly ICropProductionIrrigationSectorQueryRepository _cropProductionIrrigationSectorQueryRepository;

        public UpdateCropProductionIrrigationSectorHandler(ICropProductionIrrigationSectorCommandRepository cropProductionIrrigationSectorCommandRepository, ICropProductionIrrigationSectorQueryRepository cropProductionIrrigationSectorQueryRepository)
        {
            _cropProductionIrrigationSectorCommandRepository = cropProductionIrrigationSectorCommandRepository;
            _cropProductionIrrigationSectorQueryRepository = cropProductionIrrigationSectorQueryRepository;
        }

        public async Task<Response<UpdateCropProductionIrrigationSectorResponse>> Handle(UpdateCropProductionIrrigationSectorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCropProductionIrrigationSectorValidator validator = new UpdateCropProductionIrrigationSectorValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCropProductionIrrigationSectorResponse>(new Exception(errors.ToString()));
                }

                CropProductionIrrigationSector getResult = await _cropProductionIrrigationSectorQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CropProductionId = command.CropProductionId;
                    getResult.Name = command.Name;
                    getResult.Polygon = command.Polygon;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _cropProductionIrrigationSectorCommandRepository.GetSessionUserId();
                }

                CropProductionIrrigationSector updateCropProductionIrrigationSectorResult = await _cropProductionIrrigationSectorCommandRepository.UpdateAsync(getResult);

                if (updateCropProductionIrrigationSectorResult != null)
                {
                    UpdateCropProductionIrrigationSectorResponse updateCropProductionIrrigationSectorResponse = AgronomicMapper.Mapper.Map<UpdateCropProductionIrrigationSectorResponse>(updateCropProductionIrrigationSectorResult);

                    return new Response<UpdateCropProductionIrrigationSectorResponse>(updateCropProductionIrrigationSectorResponse);
                }
                return new Response<UpdateCropProductionIrrigationSectorResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropProductionIrrigationSectorResponse>(ex);
            }
        }
    }
}
