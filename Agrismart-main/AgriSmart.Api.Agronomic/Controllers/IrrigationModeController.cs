using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AgriSmart.API.Agronomic.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class IrrigationModeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public IrrigationModeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all irrigation modes
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllIrrigationModesResponse>>> Get()
        {
            var query = new GetAllIrrigationModesQuery();
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get irrigation mode by ID
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetIrrigationModeByIdResponse>>> GetById([FromRoute] int id)
        {
            var query = new GetIrrigationModeByIdQuery { Id = id };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Create a new irrigation mode
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateIrrigationModeResponse>>> Post([FromBody] CreateIrrigationModeCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Update an existing irrigation mode
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<UpdateIrrigationModeResponse>>> Put([FromBody] UpdateIrrigationModeCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete an irrigation mode
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteIrrigationModeResponse>>> Delete([FromRoute] int id)
        {
            var command = new DeleteIrrigationModeCommand { Id = id };
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }
    }
}