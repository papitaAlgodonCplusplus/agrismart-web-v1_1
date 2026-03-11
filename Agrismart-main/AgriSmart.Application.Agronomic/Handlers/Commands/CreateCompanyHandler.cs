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
    public class CreateCompanyHandler : IRequestHandler<CreateCompanyCommand, Response<CreateCompanyResponse>>
    {
        private readonly ICompanyCommandRepository _companyCommandRepository;

        public CreateCompanyHandler(ICompanyCommandRepository companyCommandRepository)
        {
            _companyCommandRepository = companyCommandRepository;
        }

        public async Task<Response<CreateCompanyResponse>> Handle(CreateCompanyCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCompanyValidator validator = new CreateCompanyValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCompanyResponse>(new Exception(errors.ToString()));
                }

                Company newObject = AgronomicMapper.Mapper.Map<Company>(command);
                newObject.CreatedBy = _companyCommandRepository.GetSessionUserId();
                newObject.Active = true;

                var createObjectResult = await _companyCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {                    
                    CreateCompanyResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateCompanyResponse>(createObjectResult);
                    return new Response<CreateCompanyResponse>(createObjectResponse);
                }
                return new Response<CreateCompanyResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCompanyResponse>(ex);
            }
        }
    }
}
