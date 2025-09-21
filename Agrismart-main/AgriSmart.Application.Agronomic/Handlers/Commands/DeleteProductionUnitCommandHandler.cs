using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteProductionUnitCommandHandler : IRequestHandler<DeleteProductionUnitCommand, Response<DeleteProductionUnitResponse>>
    {
        private readonly IProductionUnitCommandRepository _productionUnitCommandRepository;

        public DeleteProductionUnitCommandHandler(IProductionUnitCommandRepository productionUnitCommandRepository)
        {
            _productionUnitCommandRepository = productionUnitCommandRepository;
        }

        public async Task<Response<DeleteProductionUnitResponse>> Handle(DeleteProductionUnitCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteProductionUnitValidator validator = new DeleteProductionUnitValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteProductionUnitResponse>(new Exception(errors.ToString()));
                }

                ProductionUnit deleteProductionUnit = AgronomicMapper.Mapper.Map<ProductionUnit>(command);

                await _productionUnitCommandRepository.DeleteAsync(deleteProductionUnit);

                return new Response<DeleteProductionUnitResponse>(new DeleteProductionUnitResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteProductionUnitResponse>(ex);
            }
        }
    }
}