using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateCropProductionSpecsCommandHandler : IRequestHandler<UpdateCropProductionSpecsCommand, Response<UpdateCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsCommandRepository _commandRepository;
        private readonly ICropProductionSpecsQueryRepository _queryRepository;

        public UpdateCropProductionSpecsCommandHandler(
            ICropProductionSpecsCommandRepository commandRepository,
            ICropProductionSpecsQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<UpdateCropProductionSpecsResponse>> Handle(UpdateCropProductionSpecsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var entity = await _queryRepository.GetByIdAsync(request.Id);
                if (entity == null)
                {
                    return new Response<UpdateCropProductionSpecsResponse>
                    {
                        Success = false,
                        Exception = "Crop production specs not found"
                    };
                }

                entity.Name = request.Name;
                entity.Description = request.Description;
                entity.BetweenRowDistance = request.BetweenRowDistance;
                entity.BetweenContainerDistance = request.BetweenContainerDistance;
                entity.BetweenPlantDistance = request.BetweenPlantDistance;
                entity.Area = request.Area;
                entity.ContainerVolume = request.ContainerVolume;
                entity.AvailableWaterPercentage = request.AvailableWaterPercentage;
                entity.Active = request.Active;
                entity.UpdatedBy = request.UpdatedBy;

                var result = await _commandRepository.UpdateAsync(entity);

                var response = new UpdateCropProductionSpecsResponse
                {
                    Id = result.Id,
                    Name = result.Name,
                    Description = result.Description,
                    BetweenRowDistance = result.BetweenRowDistance,
                    BetweenContainerDistance = result.BetweenContainerDistance,
                    BetweenPlantDistance = result.BetweenPlantDistance,
                    Area = result.Area,
                    ContainerVolume = result.ContainerVolume,
                    AvailableWaterPercentage = result.AvailableWaterPercentage,
                    Active = result.Active
                };

                return new Response<UpdateCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropProductionSpecsResponse>(ex);
            }
        }
    }
}
