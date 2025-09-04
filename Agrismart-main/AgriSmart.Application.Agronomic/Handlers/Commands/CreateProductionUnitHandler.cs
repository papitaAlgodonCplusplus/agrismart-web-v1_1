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
    public class CreateProductionUnitHandler : IRequestHandler<CreateProductionUnitCommand, Response<CreateProductionUnitResponse>>
    {
        private readonly IProductionUnitCommandRepository _productionUnitCommandRepository;

        public CreateProductionUnitHandler(IProductionUnitCommandRepository productionUnitCommandRepository)
        {
            _productionUnitCommandRepository = productionUnitCommandRepository;
        }

        public async Task<Response<CreateProductionUnitResponse>> Handle(CreateProductionUnitCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateProductionUnitValidator validator = new CreateProductionUnitValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateProductionUnitResponse>(new Exception(errors.ToString()));
                }


                ProductionUnit newProductionUnit = AgronomicMapper.Mapper.Map<ProductionUnit>(command);

                newProductionUnit.CreatedBy = _productionUnitCommandRepository.GetSessionUserId();
                newProductionUnit.Active = true;

                var createProductionUnitResult = await _productionUnitCommandRepository.CreateAsync(newProductionUnit);

                if (createProductionUnitResult != null)
                {
                    CreateProductionUnitResponse createProductionUnitResponse = AgronomicMapper.Mapper.Map<CreateProductionUnitResponse>(createProductionUnitResult);

                    return new Response<CreateProductionUnitResponse>(createProductionUnitResponse);
                }
                return new Response<CreateProductionUnitResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateProductionUnitResponse>(ex);
            }
        }
    }
}
