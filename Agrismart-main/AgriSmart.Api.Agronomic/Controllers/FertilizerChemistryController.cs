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
    public class FertilizerChemistryController : ControllerBase
    {
        private readonly IMediator _mediator;
        public FertilizerChemistryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllFertilizerChemistriesResponse>>> Get([FromQuery] GetAllFertilizerChemistriesQuery query)
        {
            if (query == null)
                query = new GetAllFertilizerChemistriesQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetFertilizerChemistryByIdResponse>>> GetById([FromRoute] GetFertilizerChemistryByIdQuery query)
        {
            if (query == null)
                query = new GetFertilizerChemistryByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateFertilizerChemistryResponse>>> Post(CreateFertilizerChemistryCommand command)
        {

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateFertilizerChemistryResponse>>> Put(UpdateFertilizerChemistryCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// Delete a fertilizer chemistry (soft delete)
        /// </summary>
        /// <param name="Id">Fertilizer chemistry ID to delete</param>
        /// <returns></returns>
        [HttpDelete("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<DeleteFertilizerChemistryResponse>>> Delete([FromRoute] int Id)
        {
            var command = new DeleteFertilizerChemistryCommand { Id = Id };
            var response = await _mediator.Send(command);

            if (response.Success) return Ok(response);
            if (response.Exception?.Contains("not found") == true) return NotFound(response);
            return BadRequest(response);
        }
    }
}
