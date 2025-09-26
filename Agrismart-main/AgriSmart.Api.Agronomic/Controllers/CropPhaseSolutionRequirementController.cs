// Agrismart-main/AgriSmart.Api.Agronomic/Controllers/CropPhaseSolutionRequirementController.cs
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
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
    public class CropPhaseSolutionRequirementController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CropPhaseSolutionRequirementController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all crop phase solution requirements with optional filters
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllCropPhaseSolutionRequirementsResponse>>> GetAll([FromQuery] GetAllCropPhaseSolutionRequirementsQuery query)
        {
            if (query == null)
                query = new GetAllCropPhaseSolutionRequirementsQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get crop phase solution requirement by ID
        /// </summary>
        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetCropPhaseSolutionRequirementByIdResponse>>> GetById([FromRoute] GetCropPhaseSolutionRequirementByIdQuery query)
        {
            if (query == null)
                query = new GetCropPhaseSolutionRequirementByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get crop phase solution requirements by phase ID
        /// </summary>
        [HttpGet("GetByPhaseId")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetCropPhaseSolutionRequirementByIdPhaseResponse>>> GetByPhaseId([FromQuery] GetCropPhaseSolutionRequirementByIdPhaseQuery query)
        {
            if (query == null)
                query = new GetCropPhaseSolutionRequirementByIdPhaseQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Create a new crop phase solution requirement
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateCropPhaseSolutionRequirementResponse>>> Post(CreateCropPhaseSolutionRequirementCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Update an existing crop phase solution requirement
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateCropPhaseSolutionRequirementResponse>>> Put(UpdateCropPhaseSolutionRequirementCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete a crop phase solution requirement
        /// </summary>
        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<DeleteCropPhaseSolutionRequirementResponse>>> Delete([FromRoute] DeleteCropPhaseSolutionRequirementCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get crop phase solution requirements by crop phase ID (alternative endpoint)
        /// </summary>
        [HttpGet("ByCropPhase/{cropPhaseId:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetCropPhaseSolutionRequirementsByCropPhaseResponse>>> GetByCropPhase(int cropPhaseId, [FromQuery] bool includeInactives = false)
        {
            var query = new GetCropPhaseSolutionRequirementsByCropPhaseQuery
            {
                CropPhaseId = cropPhaseId,
                IncludeInactives = includeInactives
            };

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}