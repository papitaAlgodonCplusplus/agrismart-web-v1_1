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
    public class UpdateProductionUnitHandler : IRequestHandler<UpdateProductionUnitCommand, Response<UpdateProductionUnitResponse>>
    {
        private readonly IProductionUnitCommandRepository _productionUnitCommandRepository;
        private readonly IProductionUnitQueryRepository _productionUnitQueryRepository;

        public UpdateProductionUnitHandler(IProductionUnitCommandRepository productionUnitCommandRepository, IProductionUnitQueryRepository productionUnitQueryRepository)
        {
            _productionUnitCommandRepository = productionUnitCommandRepository;
            _productionUnitQueryRepository = productionUnitQueryRepository ;            
        }

        public async Task<Response<UpdateProductionUnitResponse>> Handle(UpdateProductionUnitCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateProductionUnitValidator validator = new UpdateProductionUnitValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateProductionUnitResponse>(new Exception(errors.ToString()));
                }

                ProductionUnit getResult = await _productionUnitQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.FarmId = command.FarmId;
                    getResult.ProductionUnitTypeId = command.ProductionUnitTypeId;
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.Location = command.Location;
                    getResult.Area = command.Area;
                    getResult.Capacity = command.Capacity;
                    getResult.SoilType = command.SoilType;
                    getResult.Drainage = command.Drainage;
                    getResult.GreenhouseType = command.GreenhouseType;
                    getResult.Ventilation = command.Ventilation;
                    getResult.LightingSystem = command.LightingSystem;
                    getResult.Irrigation = command.Irrigation;
                    getResult.ClimateControl = command.ClimateControl;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _productionUnitCommandRepository.GetSessionUserId();
                }

                ProductionUnit updateProductionUnitResult = await _productionUnitCommandRepository.UpdateAsync(getResult);

                if (updateProductionUnitResult != null)
                {
                    UpdateProductionUnitResponse updateProductionUnitResponse = new UpdateProductionUnitResponse()
                    {
                        Id = updateProductionUnitResult.Id,
                        FarmId = updateProductionUnitResult.FarmId,
                        ProductionUnitTypeId = updateProductionUnitResult.ProductionUnitTypeId,
                        Name = updateProductionUnitResult.Name,
                        Description = updateProductionUnitResult.Description,
                        Location = updateProductionUnitResult.Location,
                        Area = updateProductionUnitResult.Area,
                        Capacity = updateProductionUnitResult.Capacity,
                        SoilType = updateProductionUnitResult.SoilType,
                        Drainage = updateProductionUnitResult.Drainage,
                        GreenhouseType = updateProductionUnitResult.GreenhouseType,
                        Ventilation = updateProductionUnitResult.Ventilation,
                        LightingSystem = updateProductionUnitResult.LightingSystem,
                        Irrigation = updateProductionUnitResult.Irrigation,
                        ClimateControl = updateProductionUnitResult.ClimateControl,
                        Active = updateProductionUnitResult.Active
                    };

                    return new Response<UpdateProductionUnitResponse>(updateProductionUnitResponse);
                }
                return new Response<UpdateProductionUnitResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateProductionUnitResponse>(ex);
            }
        }
    }
}
