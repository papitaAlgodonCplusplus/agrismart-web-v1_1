using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetTimeZoneByIdHandler : BaseHandler, IRequestHandler<GetTimeZoneByIdQuery, Response<GetTimeZoneByIdResponse>>
    {
        private readonly ITimeZoneQueryRepository _timeZoneQueryRepository;
       

        public GetTimeZoneByIdHandler(ITimeZoneQueryRepository timeZoneQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _timeZoneQueryRepository = timeZoneQueryRepository;               
        }

        public async Task<Response<GetTimeZoneByIdResponse>> Handle(GetTimeZoneByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetTimeZoneByIdValidator validator = new GetTimeZoneByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetTimeZoneByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _timeZoneQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetTimeZoneByIdResponse getTimeZoneByIdResponse = new GetTimeZoneByIdResponse();
                    getTimeZoneByIdResponse.TimeZone = getResult;
                    return new Response<GetTimeZoneByIdResponse>(getTimeZoneByIdResponse);
                }
                return new Response<GetTimeZoneByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetTimeZoneByIdResponse>(ex);
            }
        }
    }
}
