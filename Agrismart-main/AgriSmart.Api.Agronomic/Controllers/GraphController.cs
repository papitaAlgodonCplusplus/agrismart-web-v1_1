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
    public class GraphController : ControllerBase
    {
        private readonly IMediator _mediator;
        public GraphController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllGraphsResponse>>> GetAll([FromQuery] GetAllGraphsQuery query)
        {

            if (query == null)
                query = new GetAllGraphsQuery();           

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetGraphByIdResponse>>> GetById([FromRoute] GetGraphByIdQuery query)
        {
            if (query == null)
                query = new GetGraphByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateGraphResponse>>> Post(CreateGraphCommand command)
        {

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="command"></param>
        /// <returns></returns>
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateGraphResponse>>> Put(UpdateGraphCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}
