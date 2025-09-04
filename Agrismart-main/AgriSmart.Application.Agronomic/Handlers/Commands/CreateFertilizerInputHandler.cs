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
    public class CreateFertilizerInputHandler : IRequestHandler<CreateFertilizerInputCommand, Response<CreateFertilizerInputResponse>>
    {
        private readonly IFertilizerInputCommandRepository _fertilizerInputCommandRepository;

        public CreateFertilizerInputHandler(IFertilizerInputCommandRepository fertilizerInputCommandRepository)
        {
            _fertilizerInputCommandRepository = fertilizerInputCommandRepository;
        }

        public async Task<Response<CreateFertilizerInputResponse>> Handle(CreateFertilizerInputCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateFertilizerInputValidator validator = new CreateFertilizerInputValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateFertilizerInputResponse>(new Exception(errors.ToString()));
                }

                FertilizerInput newObject = AgronomicMapper.Mapper.Map<FertilizerInput>(command);
                newObject.CreatedBy = _fertilizerInputCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _fertilizerInputCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateFertilizerInputResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateFertilizerInputResponse>(createObjectResult);
                    return new Response<CreateFertilizerInputResponse>(createObjectResponse);
                }
                return new Response<CreateFertilizerInputResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateFertilizerInputResponse>(ex);
            }
        }
    }
}
