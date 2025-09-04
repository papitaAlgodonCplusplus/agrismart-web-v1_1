using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCalculationSettingsHandler : BaseHandler, IRequestHandler<GetAllCalculationSettingsQuery, Response<GetAllCalculationSettingsResponse>>
    {
        private readonly ICalculationSettingQueryRepository _CalculationSettingQueryRepository;
       

        public GetAllCalculationSettingsHandler(ICalculationSettingQueryRepository CalculationSettingQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _CalculationSettingQueryRepository = CalculationSettingQueryRepository;               
        }

        public async Task<Response<GetAllCalculationSettingsResponse>> Handle(GetAllCalculationSettingsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCalculationSettingsValidator validator = new GetAllCalculationSettingsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCalculationSettingsResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _CalculationSettingQueryRepository.GetAllAsync(query.CatalogId, query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllCalculationSettingsResponse getAllCalculationSettingsResponse = new GetAllCalculationSettingsResponse();
                    getAllCalculationSettingsResponse.CalculationSettings = getAllResult;
                    return new Response<GetAllCalculationSettingsResponse>(getAllCalculationSettingsResponse);
                }
                return new Response<GetAllCalculationSettingsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCalculationSettingsResponse>(ex);
            }
        }
    }
}