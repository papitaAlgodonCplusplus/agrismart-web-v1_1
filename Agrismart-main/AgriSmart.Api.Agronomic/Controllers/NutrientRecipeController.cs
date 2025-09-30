
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
    /// <summary>
    /// Controller for managing nutrient formulation recipes
    /// </summary>
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class NutrientRecipeController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NutrientRecipeController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all nutrient formulation recipes with optional filters
        /// </summary>
        /// <param name="query">Query parameters for filtering recipes</param>
        /// <returns>List of recipes</returns>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<GetAllNutrientRecipesResponse>>> GetAll([FromQuery] GetAllNutrientRecipesQuery query)
        {
            if (query == null)
                query = new GetAllNutrientRecipesQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get a specific nutrient recipe by ID
        /// </summary>
        /// <param name="Id">Recipe ID</param>
        /// <returns>Recipe details including fertilizers</returns>
        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<GetNutrientRecipeByIdResponse>>> GetById([FromRoute] int Id)
        {
            var query = new GetNutrientRecipeByIdQuery { Id = Id };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Create a new nutrient formulation recipe
        /// </summary>
        /// <param name="command">Recipe creation data</param>
        /// <returns>Created recipe information</returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<CreateNutrientRecipeResponse>>> Post([FromBody] CreateNutrientRecipeCommand command)
        {
            if (command == null)
                return BadRequest(new Response<CreateNutrientRecipeResponse>(new Exception("Invalid request data")));

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Update an existing nutrient recipe
        /// </summary>
        /// <param name="command">Recipe update data</param>
        /// <returns>Updated recipe information</returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<UpdateNutrientRecipeResponse>>> Put([FromBody] UpdateNutrientRecipeCommand command)
        {
            if (command == null)
                return BadRequest(new Response<UpdateNutrientRecipeResponse>(new Exception("Invalid request data")));

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete a nutrient recipe (soft delete)
        /// </summary>
        /// <param name="Id">Recipe ID to delete</param>
        /// <returns>Deletion confirmation</returns>
        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Response<DeleteNutrientRecipeResponse>>> Delete([FromRoute] int Id)
        {
            var command = new DeleteNutrientRecipeCommand { Id = Id };
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            if (response.Exception?.Contains("not found") == true)
                return NotFound(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get recipes by crop
        /// </summary>
        /// <param name="cropId">Crop ID</param>
        /// <returns>List of recipes for the crop</returns>
        [HttpGet("ByCrop/{cropId:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllNutrientRecipesResponse>>> GetByCrop([FromRoute] int cropId)
        {
            var query = new GetAllNutrientRecipesQuery { CropId = cropId };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get recipes by crop phase
        /// </summary>
        /// <param name="cropId">Crop ID</param>
        /// <param name="phaseId">Phase ID</param>
        /// <returns>List of recipes for the crop phase</returns>
        [HttpGet("ByCropPhase/{cropId:int}/{phaseId:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllNutrientRecipesResponse>>> GetByCropPhase(
            [FromRoute] int cropId, 
            [FromRoute] int phaseId)
        {
            var query = new GetAllNutrientRecipesQuery 
            { 
                CropId = cropId, 
                CropPhaseId = phaseId 
            };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Get recipes by type (Simple or Advanced)
        /// </summary>
        /// <param name="recipeType">Recipe type</param>
        /// <returns>List of recipes of the specified type</returns>
        [HttpGet("ByType/{recipeType}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllNutrientRecipesResponse>>> GetByType([FromRoute] string recipeType)
        {
            var query = new GetAllNutrientRecipesQuery { RecipeType = recipeType };
            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}