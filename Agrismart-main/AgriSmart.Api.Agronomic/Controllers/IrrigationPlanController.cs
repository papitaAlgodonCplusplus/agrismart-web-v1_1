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
    public class IrrigationPlanController : ControllerBase
    {
        private readonly IMediator _mediator;

        public IrrigationPlanController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all irrigation plans
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllIrrigationPlansResponse>>> Get()
        {
            var query = new GetAllIrrigationPlansQuery();
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get irrigation plan by ID
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetIrrigationPlanByIdResponse>>> GetById([FromRoute] int id)
        {
            var query = new GetIrrigationPlanByIdQuery { Id = id };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Create a new irrigation plan
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateIrrigationPlanResponse>>> Post([FromBody] CreateIrrigationPlanCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Update an existing irrigation plan
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<UpdateIrrigationPlanResponse>>> Put([FromBody] UpdateIrrigationPlanCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete an irrigation plan
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteIrrigationPlanResponse>>> Delete([FromRoute] int id)
        {
            var command = new DeleteIrrigationPlanCommand { Id = id };
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }
    }
}