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
    public class CreateFertilizerChemistryHandler : IRequestHandler<CreateFertilizerChemistryCommand, Response<CreateFertilizerChemistryResponse>>
    {
        private readonly IFertilizerChemistryCommandRepository _fertilizerChemistryCommandRepository;

        public CreateFertilizerChemistryHandler(IFertilizerChemistryCommandRepository fertilizerChemistryCommandRepository)
        {
            _fertilizerChemistryCommandRepository = fertilizerChemistryCommandRepository;
        }

        public async Task<Response<CreateFertilizerChemistryResponse>> Handle(CreateFertilizerChemistryCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateFertilizerChemistryValidator validator = new CreateFertilizerChemistryValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateFertilizerChemistryResponse>(new Exception(errors.ToString()));
                }

                FertilizerChemistry newObject = AgronomicMapper.Mapper.Map<FertilizerChemistry>(command);
                newObject.CreatedBy = _fertilizerChemistryCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _fertilizerChemistryCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateFertilizerChemistryResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateFertilizerChemistryResponse>(createObjectResult);
                    return new Response<CreateFertilizerChemistryResponse>(createObjectResponse);
                }
                return new Response<CreateFertilizerChemistryResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateFertilizerChemistryResponse>(ex);
            }
        }
    }
}
