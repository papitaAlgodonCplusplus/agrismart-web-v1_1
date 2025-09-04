using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllMeasurementKPIsHandler : BaseHandler, IRequestHandler<GetAllMeasurementKPIsQuery, Response<GetAllMeasurementKPIsResponse>>
    {
        private readonly IMeasurementKPIQueryRepository _measurementKPIRepository;
       

        public GetAllMeasurementKPIsHandler(IMeasurementKPIQueryRepository measurementKPIRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _measurementKPIRepository = measurementKPIRepository;               
        }

        public async Task<Response<GetAllMeasurementKPIsResponse>> Handle(GetAllMeasurementKPIsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllMeasurementKPIsValidator validator = new GetAllMeasurementKPIsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllMeasurementKPIsResponse>(new Exception(errors.ToString()));
                    }

                var getAllResult = await _measurementKPIRepository.GetAllAsync(query.PeriodStartingDate, query.PeriodEndingDate, query.CropProductionId, query.KPIId);

                if (getAllResult != null)
                {
                    GetAllMeasurementKPIsResponse getAllMeasurementKPIResponse = new GetAllMeasurementKPIsResponse();
                    getAllMeasurementKPIResponse.MeasurementKPIs = getAllResult;
                    return new Response<GetAllMeasurementKPIsResponse>(getAllMeasurementKPIResponse);
                }
                return new Response<GetAllMeasurementKPIsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllMeasurementKPIsResponse>(ex);
            }
        }

    }
}
