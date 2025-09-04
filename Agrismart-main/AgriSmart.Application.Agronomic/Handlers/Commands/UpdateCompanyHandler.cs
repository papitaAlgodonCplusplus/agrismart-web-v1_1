using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateCompanyHandler : IRequestHandler<UpdateCompanyCommand, Response<UpdateCompanyResponse>>
    {
        private readonly ICompanyCommandRepository _companyCommandRepository;
        private readonly ICompanyQueryRepository _companyQueryRepository;

        public UpdateCompanyHandler(ICompanyCommandRepository companyCommandRepository, ICompanyQueryRepository companyQueryRepository)
        {
            _companyCommandRepository = companyCommandRepository;
            _companyQueryRepository = companyQueryRepository;            
        }

        public async Task<Response<UpdateCompanyResponse>> Handle(UpdateCompanyCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCompanyValidator validator = new UpdateCompanyValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCompanyResponse>(new Exception(errors.ToString()));
                }

                Company getResult = await _companyQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.ClientId = command.ClientId;
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.Active = command.Active;
                    getResult.UpdatedBy = _companyCommandRepository.GetSessionUserId();
                }

                Company updateCompanyResult = await _companyCommandRepository.UpdateAsync(getResult);

                if (updateCompanyResult != null)
                {
                    UpdateCompanyResponse updateCompanyResponse  = new UpdateCompanyResponse()
                    {
                        Id = updateCompanyResult.Id,
                        ClientId = updateCompanyResult.ClientId,
                        CatalogId = updateCompanyResult.CatalogId,
                        Name = updateCompanyResult.Name,
                        Description = updateCompanyResult.Description,
                        Active = updateCompanyResult.Active
                    };

                    return new Response<UpdateCompanyResponse>(updateCompanyResponse);
                }
                return new Response<UpdateCompanyResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCompanyResponse>(ex);
            }
        }
    }
}
