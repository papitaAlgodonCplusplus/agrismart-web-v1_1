using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AgriSmart.API.Agronomic.Controllers
{
    [Authorize]
    [ApiController]
    [Route("CropProduction/{cropProductionId}/[controller]")]
    public class SoilAnalysisController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SoilAnalysisController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all soil analyses for a crop production
        /// </summary>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetSoilAnalysesByCropProductionResponse>>> GetByCropProduction(
            [FromRoute] int cropProductionId,
            [FromQuery] bool includeInactive = false)
        {
            var query = new GetSoilAnalysesByCropProductionQuery
            {
                CropProductionId = cropProductionId,
                IncludeInactive = includeInactive
            };

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get soil analysis by ID
        /// </summary>
        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetSoilAnalysisByIdResponse>>> GetById(
            [FromRoute] int cropProductionId,
            [FromRoute] int Id)
        {
            var query = new GetSoilAnalysisByIdQuery { Id = Id };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get latest soil analysis for a crop production
        /// </summary>
        [HttpGet("latest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetLatestSoilAnalysisByCropProductionResponse>>> GetLatest(
            [FromRoute] int cropProductionId)
        {
            var query = new GetLatestSoilAnalysisByCropProductionQuery
            {
                CropProductionId = cropProductionId
            };

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Create new soil analysis
        /// </summary>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<CreateSoilAnalysisResponse>>> Post(
            [FromRoute] int cropProductionId,
            CreateSoilAnalysisCommand command)
        {
            // Ensure the cropProductionId from route matches the command
            command.CropProductionId = cropProductionId;

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Update existing soil analysis
        /// </summary>
        [HttpPut("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<UpdateSoilAnalysisResponse>>> Put(
            [FromRoute] int cropProductionId,
            [FromRoute] int Id,
            UpdateSoilAnalysisCommand command)
        {
            // Ensure the IDs from route match the command
            command.Id = Id;
            command.CropProductionId = cropProductionId;

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete soil analysis (hard delete)
        /// </summary>
        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteSoilAnalysisResponse>>> Delete(
            [FromRoute] int cropProductionId,
            [FromRoute] int Id)
        {
            var command = new DeleteSoilAnalysisCommand { Id = Id };
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get available nutrients for a soil analysis (pH-adjusted)
        /// </summary>
        [HttpGet("{soilAnalysisId:int}/available-nutrients")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetAvailableNutrientsResponse>>> GetAvailableNutrients(
            [FromRoute] int cropProductionId,
            [FromRoute] int soilAnalysisId)
        {
            var query = new GetAvailableNutrientsQuery { SoilAnalysisId = soilAnalysisId };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }

    /// <summary>
    /// Soil Analysis Reference Data Controller (not scoped to crop production)
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("SoilAnalysis")]
    public class SoilAnalysisReferenceController : ControllerBase
    {
        private readonly IMediator _mediator;

        public SoilAnalysisReferenceController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all soil texture classes (reference data)
        /// </summary>
        [HttpGet("texture-classes")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllSoilTextureClassesResponse>>> GetTextureClasses()
        {
            var query = new GetAllSoilTextureClassesQuery();
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Validate soil texture percentages
        /// </summary>
        [HttpGet("validate-texture")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<ValidateTextureResponse>>> ValidateTexture(
            [FromQuery] decimal sand,
            [FromQuery] decimal silt,
            [FromQuery] decimal clay)
        {
            var query = new ValidateTextureQuery
            {
                Sand = sand,
                Silt = silt,
                Clay = clay
            };

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}
