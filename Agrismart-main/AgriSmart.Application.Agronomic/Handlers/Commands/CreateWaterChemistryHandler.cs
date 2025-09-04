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
    public class CreateWaterChemistryHandler : IRequestHandler<CreateWaterChemistryCommand, Response<CreateWaterChemistryResponse>>
    {
        private readonly IWaterChemistryCommandRepository _WaterChemistryCommandRepository;

        public CreateWaterChemistryHandler(IWaterChemistryCommandRepository WaterChemistryCommandRepository)
        {
            _WaterChemistryCommandRepository = WaterChemistryCommandRepository;
        }

        public async Task<Response<CreateWaterChemistryResponse>> Handle(CreateWaterChemistryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateWaterChemistryValidator validator = new CreateWaterChemistryValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateWaterChemistryResponse>(new Exception(errors.ToString()));
                }

                WaterChemistry newObject = AgronomicMapper.Mapper.Map<WaterChemistry>(command);
                newObject.CreatedBy = _WaterChemistryCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _WaterChemistryCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateWaterChemistryResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateWaterChemistryResponse>(createObjectResult);
                    return new Response<CreateWaterChemistryResponse>(createObjectResponse);
                }
                return new Response<CreateWaterChemistryResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateWaterChemistryResponse>(ex);
            }
        }
    }
}
