using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllMeasurementsBaseHandler : BaseHandler, IRequestHandler<GetAllMeasurementsBaseQuery, Response<GetAllMeasurementsBaseResponse>>
    {
        private readonly IMeasurementBaseQueryRepository _measurementBaseQueryRepository;
       

        public GetAllMeasurementsBaseHandler(IMeasurementBaseQueryRepository measurementBaseQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _measurementBaseQueryRepository = measurementBaseQueryRepository;               
        }

        public async Task<Response<GetAllMeasurementsBaseResponse>> Handle(GetAllMeasurementsBaseQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllMeasurementsBaseValidator validator = new GetAllMeasurementsBaseValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllMeasurementsBaseResponse>(new Exception(errors.ToString()));
                    }

                var getAllResult = await _measurementBaseQueryRepository.GetAllAsync(query.PeriodStartingDate, query.PeriodEndingDate, query.CropProductionId, query.MeasurementVariableId);

                if (getAllResult != null)
                {
                    GetAllMeasurementsBaseResponse getAllMeasurementResponse = new GetAllMeasurementsBaseResponse();
                    getAllMeasurementResponse.Measurements = getAllResult;
                    return new Response<GetAllMeasurementsBaseResponse>(getAllMeasurementResponse);
                }
                return new Response<GetAllMeasurementsBaseResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllMeasurementsBaseResponse>(ex);
            }
        }
    }
}
