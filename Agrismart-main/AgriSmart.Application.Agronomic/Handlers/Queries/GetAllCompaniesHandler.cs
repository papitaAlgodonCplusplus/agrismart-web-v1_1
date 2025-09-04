using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    /// <summary>
    /// Handler to return all the companies that belong to the user session clientid
    /// </summary>
    public class GetAllCompaniesHandler : IRequestHandler<GetAllCompaniesQuery, Response<GetAllCompaniesResponse>>
    {
        private readonly ICompanyQueryRepository _companyQueryRepository;

        public GetAllCompaniesHandler(ICompanyQueryRepository companyQueryRepository)
        {
            _companyQueryRepository = companyQueryRepository;
        }

        public async Task<Response<GetAllCompaniesResponse>> Handle(GetAllCompaniesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCompaniesValidator validator = new GetAllCompaniesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCompaniesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _companyQueryRepository.GetAllAsync(query.ClientId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCompaniesResponse getAllCompaniesResponse = new GetAllCompaniesResponse();
                    getAllCompaniesResponse.Companies = getAllResult;
                    return new Response<GetAllCompaniesResponse>(getAllCompaniesResponse);
                }
                return new Response<GetAllCompaniesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCompaniesResponse>(ex);
            }
        }
    }
}
