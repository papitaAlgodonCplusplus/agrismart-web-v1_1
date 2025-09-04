using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.API.Agronomic.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class DeviceRawDataController : ControllerBase
    {
        private readonly IMediator _mediator;
        public DeviceRawDataController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("ProcessMeasurementsByDevice")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<ProcessDeviceRawDataMeasurementsResponse>>> Post(ProcessDeviceRawDataMeasurementsCommand query)
        {
            if (query == null)
                query = new ProcessDeviceRawDataMeasurementsCommand();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPost("ProcessMeasurementsByCropProduction")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<ProcessCropProductionRawDataMeasurementsResponse>>> Post(ProcessCropProductionRawDataMeasurementsCommand query)
        {
            if (query == null)
                query = new ProcessCropProductionRawDataMeasurementsCommand();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}
