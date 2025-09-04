using AgriSmart.Application.Iot.Commands;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.Api.Iot.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class SecurityController : ControllerBase
    {        
        private readonly IMediator _mediator;
        public SecurityController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Authenticates a device to start sending data to MQTTBroker
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("AuthenticateDevice")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<AuthenticateDeviceResponse>>> AuthenticateDevice(AuthenticateDeviceCommand command)
        {
            if (command == null)
                command = new AuthenticateDeviceCommand();

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Authenticates a new MQTTBroker connection
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("AuthenticateMqttConnection")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<AuthenticateMqttClientResponse>>> AuthenticateMqttClient(AuthenticateMqttClientCommand command)
        {
            if (command == null)
                command = new AuthenticateMqttClientCommand();

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }


    }
}