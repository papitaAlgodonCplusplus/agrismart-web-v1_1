using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.API.Agronomic.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TimeZoneController : ControllerBase
    {
        private readonly IMediator _mediator;
        public TimeZoneController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllTimeZonesResponse>>> Get([FromQuery] GetAllTimeZonesQuery query)
        {
            if (query == null)
                query = new GetAllTimeZonesQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetTimeZoneByIdResponse>>> GetById([FromRoute] GetTimeZoneByIdQuery query)
        {
            if (query == null)
                query = new GetTimeZoneByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}
