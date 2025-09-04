using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllMeasurementVariableStandardsHandler : BaseHandler, IRequestHandler<GetAllMeasurementVariableStandardsQuery, Response<GetAllMeasurementVariableStandardsResponse>>
    {
        private readonly IMeasurementVariableStandardQueryRepository _measurementVariableStandardQueryRepository;
       

        public GetAllMeasurementVariableStandardsHandler(IMeasurementVariableStandardQueryRepository measurementVariableStandardQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _measurementVariableStandardQueryRepository = measurementVariableStandardQueryRepository;               
        }

        public async Task<Response<GetAllMeasurementVariableStandardsResponse>> Handle(GetAllMeasurementVariableStandardsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllMeasurementVariablesStandardValidator validator = new GetAllMeasurementVariablesStandardValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllMeasurementVariableStandardsResponse>(new Exception(errors.ToString()));
                    }

                var getAllResult = await _measurementVariableStandardQueryRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllMeasurementVariableStandardsResponse getAllMeasurementVariablesStandardResponse = new GetAllMeasurementVariableStandardsResponse();
                    getAllMeasurementVariablesStandardResponse.MeasurementVariableStandards = getAllResult;
                    return new Response<GetAllMeasurementVariableStandardsResponse>(getAllMeasurementVariablesStandardResponse);
                }
                return new Response<GetAllMeasurementVariableStandardsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllMeasurementVariableStandardsResponse>(ex);
            }
        }
    }
}
