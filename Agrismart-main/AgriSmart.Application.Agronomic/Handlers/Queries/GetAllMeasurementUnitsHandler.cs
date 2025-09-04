using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllMeasurementUnitsHandler : BaseHandler, IRequestHandler<GetAllMeasurementUnitsQuery, Response<GetAllMeasurementUnitResponse>>
    {
        private readonly IMeasurementUnitQueryRepository _measurementUnitsRepository;
       

        public GetAllMeasurementUnitsHandler(IMeasurementUnitQueryRepository measuremetUnitsQueryRepository, IHttpContextAccessor httpContextAccessor) : base(httpContextAccessor) 
        {
            _measurementUnitsRepository = measuremetUnitsQueryRepository;               
        }

        public async Task<Response<GetAllMeasurementUnitResponse>> Handle(GetAllMeasurementUnitsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllMeasurementUnitsValidator validator = new GetAllMeasurementUnitsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllMeasurementUnitResponse>(new Exception(errors.ToString()));
                    }

                var getAllResult = await _measurementUnitsRepository.GetAllAsync(query.IncludeInactives);

                if (getAllResult != null)
                {
                    GetAllMeasurementUnitResponse getAllMeasurementUnitsResponse = new GetAllMeasurementUnitResponse();
                    getAllMeasurementUnitsResponse.MeasurementUnits = getAllResult;
                    return new Response<GetAllMeasurementUnitResponse>(getAllMeasurementUnitsResponse);
                }
                return new Response<GetAllMeasurementUnitResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllMeasurementUnitResponse>(ex);
            }
        }
    }
}
