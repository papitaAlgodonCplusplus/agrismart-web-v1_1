using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateCropProductionSpecsCommandHandler : IRequestHandler<CreateCropProductionSpecsCommand, Response<CreateCropProductionSpecsResponse>>
    {
        private readonly ICropProductionSpecsCommandRepository _repository;

        public CreateCropProductionSpecsCommandHandler(ICropProductionSpecsCommandRepository repository)
        {
            _repository = repository;
        }

        public async Task<Response<CreateCropProductionSpecsResponse>> Handle(CreateCropProductionSpecsCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var entity = new CropProductionSpecs
                {
                    Name = request.Name,
                    Description = request.Description,
                    BetweenRowDistance = request.BetweenRowDistance,
                    BetweenContainerDistance = request.BetweenContainerDistance,
                    BetweenPlantDistance = request.BetweenPlantDistance,
                    Area = request.Area,
                    ContainerVolume = request.ContainerVolume,
                    AvailableWaterPercentage = request.AvailableWaterPercentage,
                    CreatedBy = request.CreatedBy,
                    Active = true
                };

                var result = await _repository.CreateAsync(entity);

                var response = new CreateCropProductionSpecsResponse
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

                return new Response<CreateCropProductionSpecsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<CreateCropProductionSpecsResponse>(ex);
            }
        }
    }
}
