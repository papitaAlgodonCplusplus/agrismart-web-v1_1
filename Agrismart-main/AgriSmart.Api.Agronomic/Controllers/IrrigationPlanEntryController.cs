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
    public class IrrigationPlanEntryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public IrrigationPlanEntryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all irrigation plan entries, optionally filtered by plan or mode
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllIrrigationPlanEntriesResponse>>> Get(
            [FromQuery] int? irrigationPlanId,
            [FromQuery] int? irrigationModeId)
        {
            var query = new GetAllIrrigationPlanEntriesQuery
            {
                IrrigationPlanId = irrigationPlanId,
                IrrigationModeId = irrigationModeId
            };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get irrigation plan entries filtered by SectorID, CompanyID, and/or CropID
        /// </summary>
        [HttpGet("by-sector-company-crop")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetIrrigationPlanEntriesBySectorCompanyCropResponse>>> GetBySectorCompanyCrop(
            [FromQuery] int? sectorId,
            [FromQuery] int? companyId,
            [FromQuery] int? cropId)
        {
            var query = new GetIrrigationPlanEntriesBySectorCompanyCropQuery
            {
                SectorId = sectorId,
                CompanyId = companyId,
                CropId = cropId
            };

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
        
        /// <summary>
        /// Get irrigation plan entry by ID
        /// </summary>
        [HttpGet("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetIrrigationPlanEntryByIdResponse>>> GetById([FromRoute] int id)
        {
            var query = new GetIrrigationPlanEntryByIdQuery { Id = id };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Create a new irrigation plan entry
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateIrrigationPlanEntryResponse>>> Post([FromBody] CreateIrrigationPlanEntryCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Update an existing irrigation plan entry
        /// </summary>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<UpdateIrrigationPlanEntryResponse>>> Put([FromBody] UpdateIrrigationPlanEntryCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete an irrigation plan entry
        /// </summary>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteIrrigationPlanEntryResponse>>> Delete([FromRoute] int id)
        {
            var command = new DeleteIrrigationPlanEntryCommand { Id = id };
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }
    }
}