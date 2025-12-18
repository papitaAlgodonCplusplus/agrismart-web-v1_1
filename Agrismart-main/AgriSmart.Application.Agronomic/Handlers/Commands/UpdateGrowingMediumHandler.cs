using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateGrowingMediumHandler : IRequestHandler<UpdateGrowingMediumCommand, Response<UpdateGrowingMediumResponse>>
    {
        private readonly IGrowingMediumCommandRepository _growingMediumCommandRepository;
        private readonly IGrowingMediumQueryRepository _growingMediumQueryRepository;

        public UpdateGrowingMediumHandler(IGrowingMediumCommandRepository growingMediumCommandRepository, IGrowingMediumQueryRepository growingMediumQueryRepository)
        {
            _growingMediumCommandRepository = growingMediumCommandRepository;
            _growingMediumQueryRepository = growingMediumQueryRepository;
        }

        public async Task<Response<UpdateGrowingMediumResponse>> Handle(UpdateGrowingMediumCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateGrowingMediumValidator validator = new UpdateGrowingMediumValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateGrowingMediumResponse>(new Exception(errors.ToString()));
                }

                GrowingMedium getResult = await _growingMediumQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.ContainerCapacityPercentage = command.ContainerCapacityPercentage;
                    getResult.PermanentWiltingPoint = command.PermanentWiltingPoint;
                    getResult.FiveKpaHumidity = command.FiveKpaHumidity;
                    getResult.EaselyAvailableWaterPercentage = command.EaselyAvailableWaterPercentage;
                    getResult.ReserveWaterPercentage = command.ReserveWaterPercentage;
                    getResult.TotalAvailableWaterPercentage = command.TotalAvailableWaterPercentage;
                    getResult.Active = command.Active;
                }

                GrowingMedium updateGrowingMediumResult = await _growingMediumCommandRepository.UpdateAsync(getResult);

                if (updateGrowingMediumResult != null)
                {
                    UpdateGrowingMediumResponse updateGrowingMediumResponse = new UpdateGrowingMediumResponse()
                    {
                        Id = updateGrowingMediumResult.Id,
                        CatalogId = updateGrowingMediumResult.CatalogId,
                        Name = updateGrowingMediumResult.Name,
                        ContainerCapacityPercentage = updateGrowingMediumResult.ContainerCapacityPercentage,
                        PermanentWiltingPoint = updateGrowingMediumResult.PermanentWiltingPoint,
                        FiveKpaHumidity = updateGrowingMediumResult.FiveKpaHumidity,
                        EaselyAvailableWaterPercentage = updateGrowingMediumResult.EaselyAvailableWaterPercentage,
                        ReserveWaterPercentage = updateGrowingMediumResult.ReserveWaterPercentage,
                        TotalAvailableWaterPercentage = updateGrowingMediumResult.TotalAvailableWaterPercentage,
                        Active = updateGrowingMediumResult.Active
                    };

                    return new Response<UpdateGrowingMediumResponse>(updateGrowingMediumResponse);
                }
                return new Response<UpdateGrowingMediumResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateGrowingMediumResponse>(ex);
            }
        }
    }
}
