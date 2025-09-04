using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateCompanyHandler : IRequestHandler<CreateCompanyCommand, Response<CreateCompanyResponse>>
    {
        private readonly ICompanyCommandRepository _companyCommandRepository;
        private readonly ICompanyQueryRepository _companyQueryRepository;
        private readonly ILicenseQueryRepository _licenseQueryRepository;

        public CreateCompanyHandler(ICompanyCommandRepository companyCommandRepository, ICompanyQueryRepository companyQueryRepository, ILicenseQueryRepository licenseQueryRepository)
        {
            _companyCommandRepository = companyCommandRepository;
            _companyQueryRepository = companyQueryRepository;
            _licenseQueryRepository = licenseQueryRepository; 
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

                int activeCompanies = _companyQueryRepository.GetAllAsync(command.ClientId).Result.ToList().Count();
                int licenseCompanies = _licenseQueryRepository.GetAllAsync(command.ClientId).Result.ToList().OrderByDescending(p=>p.ExpirationDate).FirstOrDefault().AllowedCompanies;

                if (activeCompanies >= licenseCompanies) return new Response<CreateCompanyResponse>(new Exception("Max companies quantity reached"));
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
