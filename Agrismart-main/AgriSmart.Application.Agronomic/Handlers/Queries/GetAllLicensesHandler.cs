using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    /// <summary>
    /// Handler to return all the licenses that belong to the user session clientid
    /// </summary>
    public class GetAllLicensesHandler : IRequestHandler<GetAllLicensesQuery, Response<GetAllLicensesResponse>>
    {
        private readonly ILicenseQueryRepository _licenseQueryRepository;

        public GetAllLicensesHandler(ILicenseQueryRepository licenseQueryRepository)
        {
            _licenseQueryRepository = licenseQueryRepository;
        }

        public async Task<Response<GetAllLicensesResponse>> Handle(GetAllLicensesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllLicensesValidator validator = new GetAllLicensesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllLicensesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _licenseQueryRepository.GetAllAsync(query.ClientId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllLicensesResponse getAllLicensesResponse = new GetAllLicensesResponse();
                    getAllLicensesResponse.Licenses = getAllResult;
                    return new Response<GetAllLicensesResponse>(getAllLicensesResponse);
                }
                return new Response<GetAllLicensesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllLicensesResponse>(ex);
            }
        }
    }
}
