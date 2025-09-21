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
    public class FertilizerInputController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FertilizerInputController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllFertilizerInputsResponse>>> Get([FromQuery] GetAllFertilizerInputsQuery query)
        {
            if (query == null)
                query = new GetAllFertilizerInputsQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetFertilizerInputByIdResponse>>> GetById([FromRoute] GetFertilizerInputByIdQuery query)
        {
            if (query == null)
                query = new GetFertilizerInputByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateFertilizerInputResponse>>> Post(CreateFertilizerInputCommand command)
        {

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateFertilizerInputResponse>>> Put(UpdateFertilizerInputCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete a fertilizer input (soft delete)
        /// </summary>
        /// <param name="Id">Fertilizer input ID to delete</param>
        /// <returns></returns>
        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteFertilizerInputResponse>>> Delete([FromRoute] int Id)
        {
            var command = new DeleteFertilizerInputCommand { Id = Id };
            var response = await _mediator.Send(command);

            if (response.Success) return Ok(response);
            if (response.Exception?.Contains("not found") == true) return NotFound(response);
            return BadRequest(response);
        }
    }
}
