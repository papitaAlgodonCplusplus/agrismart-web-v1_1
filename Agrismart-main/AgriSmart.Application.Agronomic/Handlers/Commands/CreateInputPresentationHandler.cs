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
    public class CreateInputPresentationHandler : IRequestHandler<CreateInputPresentationCommand, Response<CreateInputPresentationResponse>>
    {
        private readonly IInputPresentationCommandRepository _inputPresentationCommandRepository;

        public CreateInputPresentationHandler(IInputPresentationCommandRepository inputPresentationCommandRepository)
        {
            _inputPresentationCommandRepository = inputPresentationCommandRepository;
        }

        public async Task<Response<CreateInputPresentationResponse>> Handle(CreateInputPresentationCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateInputPresentationValidator validator = new CreateInputPresentationValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateInputPresentationResponse>(new Exception(errors.ToString()));
                }

                InputPresentation newObject = AgronomicMapper.Mapper.Map<InputPresentation>(command);
                newObject.CreatedBy = _inputPresentationCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _inputPresentationCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateInputPresentationResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateInputPresentationResponse>(createObjectResult);
                    return new Response<CreateInputPresentationResponse>(createObjectResponse);
                }
                return new Response<CreateInputPresentationResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateInputPresentationResponse>(ex);
            }
        }
    }
}
