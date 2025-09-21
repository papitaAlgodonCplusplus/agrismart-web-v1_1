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
    public class CropController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CropController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllCropsResponse>>> Get([FromQuery] GetAllCropsQuery query)
        {
            if (query == null)
                query = new GetAllCropsQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetCropByIdResponse>>> GetById([FromRoute] GetCropByIdQuery query)
        {
            if (query == null)
                query = new GetCropByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Create a new crop
        /// </summary>
        /// <param name="command">Crop creation data</param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateCropResponse>>> Post(CreateCropCommand command)
        {
            var response = await _mediator.Send(command);
            if (response.Success) return Ok(response);
            return BadRequest(response);
        }

        /// <summary>
        /// Update an existing crop
        /// </summary>
        /// <param name="command">Crop update data</param>
        /// <returns></returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateCropResponse>>> Put(UpdateCropCommand command)
        {
            var response = await _mediator.Send(command);
            if (response.Success) return Ok(response);
            return BadRequest(response);
        }

        /// <summary>
        /// Delete a crop (soft delete)
        /// </summary>
        /// <param name="Id">Crop ID to delete</param>
        /// <returns></returns>
        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteCropResponse>>> Delete([FromRoute] int Id)
        {
            var command = new DeleteCropCommand { Id = Id };
            var response = await _mediator.Send(command);

            if (response.Success) return Ok(response);
            if (response.Exception?.Contains("not found") == true) return NotFound(response);
            return BadRequest(response);
        }
    }
}
