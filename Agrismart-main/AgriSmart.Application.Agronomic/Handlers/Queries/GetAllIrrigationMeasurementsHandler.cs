using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllIrrigationMeasurementsHandler : IRequestHandler<GetAllIrrigationMeasurementsQuery, Response<GetAllIrrigationMeasurementResponse>>
    {
        private readonly IIrrigationMeasurementQueryRepository _irrigationMeasurementQueryRepository;

        public GetAllIrrigationMeasurementsHandler(IIrrigationMeasurementQueryRepository irrigationMeasurementQueryRepository)
        {
            _irrigationMeasurementQueryRepository = irrigationMeasurementQueryRepository;
        }

        public async Task<Response<GetAllIrrigationMeasurementResponse>> Handle(GetAllIrrigationMeasurementsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllIrrigationMeasurementsValidator validator = new GetAllIrrigationMeasurementsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllIrrigationMeasurementResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _irrigationMeasurementQueryRepository.GetAllAsync(query.CropProductionId, query.StartingDateTime, query.EndingDateTime);

                if (getAllResult != null)
                {
                    GetAllIrrigationMeasurementResponse getAllIrrigationMeasurementsResponse = new GetAllIrrigationMeasurementResponse();
                    getAllIrrigationMeasurementsResponse.IrrigationMeasurements = getAllResult;
                    return new Response<GetAllIrrigationMeasurementResponse>(getAllIrrigationMeasurementsResponse);
                }
                return new Response<GetAllIrrigationMeasurementResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllIrrigationMeasurementResponse>(ex);
            }
        }
    }
}
