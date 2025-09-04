using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllTimeZonesHandler : BaseHandler, IRequestHandler<GetAllTimeZonesQuery, Response<GetAllTimeZonesResponse>>
    {
        private readonly ITimeZoneQueryRepository _timeZoneQueryRepository;
       

        public GetAllTimeZonesHandler(ITimeZoneQueryRepository timeZoneQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _timeZoneQueryRepository = timeZoneQueryRepository;               
        }

        public async Task<Response<GetAllTimeZonesResponse>> Handle(GetAllTimeZonesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllTimeZonesValidator validator = new GetAllTimeZonesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllTimeZonesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _timeZoneQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllTimeZonesResponse getAllTimeZonesResponse = new GetAllTimeZonesResponse();
                    getAllTimeZonesResponse.TimeZones = getAllResult;
                    return new Response<GetAllTimeZonesResponse>(getAllTimeZonesResponse);
                }
                return new Response<GetAllTimeZonesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllTimeZonesResponse>(ex);
            }
        }
    }
}
