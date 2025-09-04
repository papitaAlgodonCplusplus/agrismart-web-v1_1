using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllSensorsHandler : IRequestHandler<GetAllSensorsQuery, Response<GetAllSensorsResponse>>
    {
        private readonly ISensorQueryRepository _sensorQueryRepository;

        public GetAllSensorsHandler(ISensorQueryRepository sensorQueryRepository)
        {
            _sensorQueryRepository = sensorQueryRepository;
        }

        public async Task<Response<GetAllSensorsResponse>> Handle(GetAllSensorsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllSensorsValidator validator = new GetAllSensorsValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllSensorsResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _sensorQueryRepository.GetAllAsync(query.CompanyId, query.DeviceId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllSensorsResponse getAllSensorsResponse = new GetAllSensorsResponse();
                    getAllSensorsResponse.Sensors = getResult;
                    return new Response<GetAllSensorsResponse>(getAllSensorsResponse);
                }
                return new Response<GetAllSensorsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllSensorsResponse>(ex);
            }
        }
    }
}
