using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Application.Iot.Commands;
using AgriSmart.Application.Iot.Validators;

namespace AgriSmart.Application.Iot.Handlers
{
    public class AuthenticateMqttClientHandler : IRequestHandler<AuthenticateMqttClientCommand, Response<AuthenticateMqttClientResponse>>
    {
        private readonly IDeviceQueryRepository _deviceQueryRepository;


        public AuthenticateMqttClientHandler(IDeviceQueryRepository deviceQueryRepository)
        {
            _deviceQueryRepository = deviceQueryRepository;
        }

        public async Task<Response<AuthenticateMqttClientResponse>> Handle(AuthenticateMqttClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (AuthenticateMqttClientValidator validator = new AuthenticateMqttClientValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<AuthenticateMqttClientResponse>(new Exception(errors.ToString()));
                }

                //authenticate mqtt client
                var authenticateMqttClientResult = await _deviceQueryRepository.AuthenticateMqttClientAsync(command.ConnectUsername, command.ConnectPassword);

                if (authenticateMqttClientResult != null)
                {
                    return new Response<AuthenticateMqttClientResponse>(new AuthenticateMqttClientResponse()
                    {
                        Authenticated = true
                    });
                }
                return new Response<AuthenticateMqttClientResponse>(new Exception("Mqtt client not authenticated"));
            }
            catch (Exception ex)
            {
                return new Response<AuthenticateMqttClientResponse>(ex);
            }
        }
    }
}
