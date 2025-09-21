using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.API.Agronomic.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WaterController : ControllerBase
    {
        private readonly IMediator _mediator;
        public WaterController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllWatersResponse>>> Get([FromQuery] GetAllWatersQuery query)
        {
            if (query == null)
                query = new GetAllWatersQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }


        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetWaterByIdResponse>>> GetById([FromRoute] GetWaterByIdQuery query)
        {
            if (query == null)
                query = new GetWaterByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }


        /// <summary>
        /// Add a Fertilizer
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateWaterResponse>>> Post(CreateWaterCommand command)
        {
            //_logger.LogInformation(command.ToString());
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Method for updating water
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateWaterResponse>>> Put(UpdateWaterCommand command)
        {
            //_logger.LogInformation(command.ToString());
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete a water (soft delete)
        /// </summary>
        /// <param name="Id">Water ID to delete</param>
        /// <returns></returns>
        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteWaterResponse>>> Delete([FromRoute] int Id)
        {
            var command = new DeleteWaterCommand { Id = Id };
            var response = await _mediator.Send(command);

            if (response.Success) return Ok(response);
            if (response.Exception?.Contains("not found") == true) return NotFound(response);
            return BadRequest(response);
        }
    }
}
