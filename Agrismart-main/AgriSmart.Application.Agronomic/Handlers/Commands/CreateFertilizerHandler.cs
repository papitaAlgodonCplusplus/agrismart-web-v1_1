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
    public class CreateFertilizerHandler : IRequestHandler<CreateFertilizerCommand, Response<CreateFertilizerResponse>>
    {
        private readonly IFertilizerCommandRepository _fertilizerCommandRepository;

        public CreateFertilizerHandler(IFertilizerCommandRepository fertilizerCommandRepository)
        {
            _fertilizerCommandRepository = fertilizerCommandRepository;
        }

        public async Task<Response<CreateFertilizerResponse>> Handle(CreateFertilizerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateFertilizerValidator validator = new CreateFertilizerValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateFertilizerResponse>(new Exception(errors.ToString()));
                }

                Fertilizer newObject = AgronomicMapper.Mapper.Map<Fertilizer>(command);
                newObject.CreatedBy = _fertilizerCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _fertilizerCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateFertilizerResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateFertilizerResponse>(createObjectResult);
                    return new Response<CreateFertilizerResponse>(createObjectResponse);
                }
                return new Response<CreateFertilizerResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateFertilizerResponse>(ex);
            }
        }
    }
}
