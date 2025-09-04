using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetLatestMeasurementKPIsHandler : BaseHandler, IRequestHandler<GetLatestMeasurementKPIsQuery, Response<GetLatestMeasurementKPIsResponse>>
    {
        private readonly IMeasurementKPIQueryRepository _measurementKPIRepository;
       

        public GetLatestMeasurementKPIsHandler(IMeasurementKPIQueryRepository measurementKPIRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _measurementKPIRepository = measurementKPIRepository;               
        }

        public async Task<Response<GetLatestMeasurementKPIsResponse>> Handle(GetLatestMeasurementKPIsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetLatestMeasurementKPIsValidator validator = new GetLatestMeasurementKPIsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetLatestMeasurementKPIsResponse>(new Exception(errors.ToString()));
                }

                var getLatestResult = await _measurementKPIRepository.GetLatestAsync(query.PeriodStartingDate, query.PeriodEndingDate, query.CropProductionId, query.KPIId);

                if (getLatestResult != null)
                {
                    GetLatestMeasurementKPIsResponse getLatestMeasurementKPIResponse = new GetLatestMeasurementKPIsResponse();
                    getLatestMeasurementKPIResponse.LatestMeasurementKPIs = getLatestResult;
                    return new Response<GetLatestMeasurementKPIsResponse>(getLatestMeasurementKPIResponse);
                }
                GetLatestMeasurementKPIsResponse emptyResponse = new GetLatestMeasurementKPIsResponse();
                MeasurementKPI emptyMeasurementKPI = new MeasurementKPI();
                emptyMeasurementKPI.RecordDate = DateTime.MinValue;
                emptyResponse.LatestMeasurementKPIs = emptyMeasurementKPI;


                return new Response<GetLatestMeasurementKPIsResponse>(emptyResponse);
            }
            catch (Exception ex)
            {
                return new Response<GetLatestMeasurementKPIsResponse>(ex);
            }
        }

    }
}
