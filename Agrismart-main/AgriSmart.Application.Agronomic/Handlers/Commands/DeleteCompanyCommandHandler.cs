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
    public class DeleteCompanyCommandHandler : IRequestHandler<DeleteCompanyCommand, Response<DeleteCompanyResponse>>
    {
        private readonly ICompanyCommandRepository _companyCommandRepository;

        public DeleteCompanyCommandHandler(ICompanyCommandRepository companyCommandRepository)
        {
            _companyCommandRepository = companyCommandRepository;
        }

        public async Task<Response<DeleteCompanyResponse>> Handle(DeleteCompanyCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteCompanyValidator validator = new DeleteCompanyValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteCompanyResponse>(new Exception(errors.ToString()));
                }

                Company deleteCompany = AgronomicMapper.Mapper.Map<Company>(command);

                await _companyCommandRepository.DeleteAsync(deleteCompany);

                return new Response<DeleteCompanyResponse>(new DeleteCompanyResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCompanyResponse>(ex);
            }
        }
    }
}