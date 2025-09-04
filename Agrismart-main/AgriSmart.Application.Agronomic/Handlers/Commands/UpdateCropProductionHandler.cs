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
    public class UpdateCropProductionHandler : IRequestHandler<UpdateCropProductionCommand, Response<UpdateCropProductionResponse>>
    {
        private readonly ICropProductionCommandRepository _cropProductionCommandRepository;
        private readonly ICropProductionQueryRepository _cropProductionQueryRepository;

        public UpdateCropProductionHandler(ICropProductionCommandRepository cropProductionCommandRepository, ICropProductionQueryRepository cropProductionQueryRepository)
        {
            _cropProductionCommandRepository = cropProductionCommandRepository;
            _cropProductionQueryRepository = cropProductionQueryRepository;
        }

        public async Task<Response<UpdateCropProductionResponse>> Handle(UpdateCropProductionCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCropProductionValidator validator = new UpdateCropProductionValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCropProductionResponse>(new Exception(errors.ToString()));
                }

                CropProduction getResult = await _cropProductionQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CropId = command.CropId;
                    getResult.ProductionUnitId = command.ProductionUnitId;
                    getResult.Name = command.Name;
                    getResult.ContainerId = command.ContainerId;
                    getResult.GrowingMediumId = command.GrowingMediumId;
                    getResult.DropperId = command.DropperId;
                    getResult.Width = command.Width;
                    getResult.Length = command.Length;
                    getResult.BetweenRowDistance = command.BetweenRowDistance;
                    getResult.BetweenContainerDistance = command.BetweenContainerDistance;
                    getResult.BetweenPlantDistance = command.BetweenPlantDistance;
                    getResult.PlantsPerContainer = command.PlantsPerContainer;
                    getResult.NumberOfDroppersPerContainer = command.NumberOfDroppersPerContainer;
                    getResult.WindSpeedMeasurementHeight = command.WindSpeedMeasurementHeight;
                    getResult.StartDate = command.StartDate;
                    getResult.EndDate = command.EndDate;
                    getResult.Altitude = command.Altitude;
                    getResult.Latitude = command.Latitude;
                    getResult.Longitude = command.Longitude;
                    getResult.DepletionPercentage = command.DepletionPercentage;
                    getResult.DrainThreshold = command.DrainThreshold;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _cropProductionCommandRepository.GetSessionUserId();
                }

                CropProduction updateCropProductionResult = await _cropProductionCommandRepository.UpdateAsync(getResult);

                if (updateCropProductionResult != null)
                {
                    UpdateCropProductionResponse updateCropProductionResponse = AgronomicMapper.Mapper.Map<UpdateCropProductionResponse>(updateCropProductionResult);

                    return new Response<UpdateCropProductionResponse>(updateCropProductionResponse);
                }
                return new Response<UpdateCropProductionResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropProductionResponse>(ex);
            }
        }
    }
}
