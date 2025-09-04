using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using AgriSmart.Application.Iot.Commands;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Application.Iot.Validators;

namespace AgriSmart.Application.Iot.Handlers
{
    public class AuthenticateDeviceHandler : IRequestHandler<AuthenticateDeviceCommand, Response<AuthenticateDeviceResponse>>
    {
        private readonly IDeviceQueryRepository _deviceQueryRepository;
        private readonly ICompanyQueryRepository _companyQueryRepository;
        private readonly ISensorQueryRepository _sensorQueryRepository;

        public AuthenticateDeviceHandler(IDeviceQueryRepository deviceQueryRepository, ICompanyQueryRepository companyQueryRepository, ISensorQueryRepository sensorQueryRepository)
        {
            _deviceQueryRepository = deviceQueryRepository;
            _companyQueryRepository = companyQueryRepository;
            _sensorQueryRepository = sensorQueryRepository;
        }

        public async Task<Response<AuthenticateDeviceResponse>> Handle(AuthenticateDeviceCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (AuthenticateDeviceValidator validator = new AuthenticateDeviceValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<AuthenticateDeviceResponse>(new Exception(errors.ToString()));
                }

                //authenticate device
                var authenticateDeviceResult = await _deviceQueryRepository.AuthenticateAsync(command.DeviceId, command.Password);

                if (authenticateDeviceResult != null)
                {
                    //get company info
                    var getCompanyResult = await _companyQueryRepository.GetByIdAsync(authenticateDeviceResult.CompanyId, true);

                    if (getCompanyResult != null)
                    {
                        //get sensors info
                        var getSensorsResult = await _sensorQueryRepository.GetAllAsync(0, authenticateDeviceResult.Id);

                        if (getSensorsResult != null)
                        {
                            return new Response<AuthenticateDeviceResponse>(new AuthenticateDeviceResponse()
                            {
                                Device = authenticateDeviceResult,
                                Company = getCompanyResult,
                                Sensors = getSensorsResult
                            });
                        }
                    }
                }
                return new Response<AuthenticateDeviceResponse>(new Exception("Device not authenticated"));
            }
            catch (Exception ex)
            {
                return new Response<AuthenticateDeviceResponse>(ex);
            }
        }


    }
}
