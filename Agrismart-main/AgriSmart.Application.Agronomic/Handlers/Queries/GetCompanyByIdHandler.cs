using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetCompanyByIdHandler : IRequestHandler<GetCompanyByIdQuery, Response<GetCompanyByIdResponse>>
    {
        private readonly ICompanyQueryRepository _companyQueryRepository;

        public GetCompanyByIdHandler(ICompanyQueryRepository companyQueryRepository)
        {
            _companyQueryRepository = companyQueryRepository;             
        }

        public async Task<Response<GetCompanyByIdResponse>> Handle(GetCompanyByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetCompanyByIdValidator validator = new GetCompanyByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetCompanyByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _companyQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetCompanyByIdResponse getObjectByIdResponse = new GetCompanyByIdResponse();
                    getObjectByIdResponse = AgronomicMapper.Mapper.Map<GetCompanyByIdResponse>(getResult);
                    return new Response<GetCompanyByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetCompanyByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetCompanyByIdResponse>(ex);
            }
        }
    }
}
