using AgriSmart.Application.Iot.Commands;
using AgriSmart.Application.Iot.Handlers;
using AgriSmart.Application.Iot.Queries;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Application.Iot.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.Api.Iot.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DeviceRawDataController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<DeviceRawDataController> _logger;

        public DeviceRawDataController(IMediator mediator, ILogger<DeviceRawDataController> logger)
        {
            _mediator = mediator;
            _logger = logger;

        }


        /// <summary>
        /// Get device raw data with optional filtering
        /// </summary>
        /// <param name="query"></param>
        /// <returns></returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllDeviceRawDataResponse>>> GetRawData([FromQuery] GetAllDeviceRawDataQuery query)
        {
            if (query == null)
                query = new GetAllDeviceRawDataQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Process data sent by device via http
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<AddDeviceRawDataResponse>>> AddRawData(AddDeviceRawDataCommand command)
        {
            _logger.LogInformation(command.ToString());
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Process data sent by device via Mqtt
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("Mqtt")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<AddMqttDeviceRawDataResponse>>> AddMqttRawData(AddMqttDeviceRawDataCommand command)
        {
            _logger.LogInformation(command.ToString());
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Process data sent by device via http
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost("ProcessRawData")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<ProcessDeviceRawDataResponse>>> ProcessRawData(ProcessDeviceRawDataCommand command)
        {
            _logger.LogInformation(command.ToString());
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}