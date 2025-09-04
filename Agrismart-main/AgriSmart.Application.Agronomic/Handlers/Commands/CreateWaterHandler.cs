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
    public class CreateWaterHandler : IRequestHandler<CreateWaterCommand, Response<CreateWaterResponse>>
    {
        private readonly IWaterCommandRepository _waterCommandRepository;

        public CreateWaterHandler(IWaterCommandRepository waterCommandRepository)
        {
             _waterCommandRepository = waterCommandRepository;
        }

        public async Task<Response<CreateWaterResponse>> Handle(CreateWaterCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateWaterValidator validator = new CreateWaterValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateWaterResponse>(new Exception(errors.ToString()));
                }

                Water newObject = AgronomicMapper.Mapper.Map<Water>(command);
                newObject.CreatedBy = _waterCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _waterCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateWaterResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateWaterResponse>(createObjectResult);
                    return new Response<CreateWaterResponse>(createObjectResponse);
                }
                return new Response<CreateWaterResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateWaterResponse>(ex);
            }
        }
    }
}
