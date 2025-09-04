using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.API.Agronomic.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class MeasurementUnitController : ControllerBase
    {
        private readonly IMediator _mediator;
        public MeasurementUnitController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllMeasurementUnitResponse>>> Get([FromQuery] GetAllMeasurementUnitsQuery query)
        {
            if (query == null)
                query = new GetAllMeasurementUnitsQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}
