using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetMeasurementVariableByIdHandler : IRequestHandler<GetMeasurementVariableByIdQuery, Response<GetMeasurementVariableByIdResponse>>
    {
        private readonly IMeasurementVariableQueryRepository _measurementVariableQueryRepository;

        public GetMeasurementVariableByIdHandler(IMeasurementVariableQueryRepository measurementVariableQueryRepository)
        {
            _measurementVariableQueryRepository = measurementVariableQueryRepository;
        }

        public async Task<Response<GetMeasurementVariableByIdResponse>> Handle(GetMeasurementVariableByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetMeasurementVariableByIdValidator validator = new GetMeasurementVariableByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetMeasurementVariableByIdResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _measurementVariableQueryRepository.GetByIdAsync(query.Id);

                if (getResult != null)
                {
                    GetMeasurementVariableByIdResponse getObjectByIdResponse = new GetMeasurementVariableByIdResponse();
                    getObjectByIdResponse.MeasurementVariable = getResult;
                    return new Response<GetMeasurementVariableByIdResponse>(getObjectByIdResponse);
                }
                return new Response<GetMeasurementVariableByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetMeasurementVariableByIdResponse>(ex);
            }
        }
    }
}
