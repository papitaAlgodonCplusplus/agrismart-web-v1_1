using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllMeasurementsHandler : BaseHandler, IRequestHandler<GetAllMeasurementsQuery, Response<GetAllMeasurementsResponse>>
    {
        private readonly IMeasurementQueryRepository _measurementRepository;
       

        public GetAllMeasurementsHandler(IMeasurementQueryRepository measurementRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _measurementRepository = measurementRepository;               
        }

        public async Task<Response<GetAllMeasurementsResponse>> Handle(GetAllMeasurementsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllMeasurementsValidator validator = new GetAllMeasurementsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllMeasurementsResponse>(new Exception(errors.ToString()));
                    }

                var getAllResult = await _measurementRepository.GetAllAsync(query.PeriodStartingDate, query.PeriodEndingDate, query.CropProductionId, query.MeasurementVariableId);

                if (getAllResult != null)
                {
                    GetAllMeasurementsResponse getAllMeasurementResponse = new GetAllMeasurementsResponse();
                    getAllMeasurementResponse.Measurements = getAllResult;
                    return new Response<GetAllMeasurementsResponse>(getAllMeasurementResponse);
                }
                return new Response<GetAllMeasurementsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllMeasurementsResponse>(ex);
            }
        }
    }
}
