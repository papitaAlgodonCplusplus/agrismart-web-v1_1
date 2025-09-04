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
                    getResult.ProductionUnitTypeId = command.ProductionUnitTypeId;
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.Active = command.Active;
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
