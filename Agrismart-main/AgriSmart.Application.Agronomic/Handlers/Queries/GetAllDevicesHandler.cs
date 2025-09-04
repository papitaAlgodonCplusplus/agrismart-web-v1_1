using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllDevicesHandler : IRequestHandler<GetAllDevicesQuery, Response<GetAllDevicesResponse>>
    {
        private readonly IDeviceQueryRepository _deviceQueryRepository;

        public GetAllDevicesHandler(IDeviceQueryRepository deviceQueryRepository)
        {
            _deviceQueryRepository = deviceQueryRepository;
        }

        public async Task<Response<GetAllDevicesResponse>> Handle(GetAllDevicesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllDevicesValidator validator = new GetAllDevicesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllDevicesResponse>(new Exception(errors.ToString()));
                }

                var getResult = await _deviceQueryRepository.GetAllAsync(query.ClientId, query.CompanyId, query.CropProductionId, query.IncludeInactives);

                if (getResult != null)
                {
                    GetAllDevicesResponse getAllDevicesResponse = new GetAllDevicesResponse();
                    getAllDevicesResponse.Devices = getResult;
                    return new Response<GetAllDevicesResponse>(getAllDevicesResponse);
                }
                return new Response<GetAllDevicesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllDevicesResponse>(ex);
            }
        }
    }
}
