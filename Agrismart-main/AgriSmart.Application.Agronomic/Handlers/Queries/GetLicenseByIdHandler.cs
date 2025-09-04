using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetLicenseByIdHandler : IRequestHandler<GetLicenseByIdQuery, Response<GetLicenseByIdResponse>>
    {
        private readonly ILicenseQueryRepository _licenseQueryRepository;

        public GetLicenseByIdHandler(ILicenseQueryRepository licenseQueryRepository)
        {
            _licenseQueryRepository = licenseQueryRepository;            
        }

        public async Task<Response<GetLicenseByIdResponse>> Handle(GetLicenseByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetLicenseByIdValidator validator = new GetLicenseByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetLicenseByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _licenseQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetLicenseByIdResponse getObjectByIdResponse = new GetLicenseByIdResponse();
                    getObjectByIdResponse.License = getResult;
                    return new Response<GetLicenseByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetLicenseByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetLicenseByIdResponse>(ex);
            }
        }
    }
}
