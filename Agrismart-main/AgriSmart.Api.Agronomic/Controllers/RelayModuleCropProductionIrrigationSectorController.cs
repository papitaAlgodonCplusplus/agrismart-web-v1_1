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
    public class RelayModuleCropProductionIrrigationSectorController : ControllerBase
    {
        private readonly IMediator _mediator;
        public RelayModuleCropProductionIrrigationSectorController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>>> Get([FromQuery] GetAllRelayModuleCropProductionIrrigationSectorsQuery query)
        {
            if (query == null)
                query = new GetAllRelayModuleCropProductionIrrigationSectorsQuery();

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
        public async Task<ActionResult<Response<CreateRelayModuleCropProductionIrrigationSectorResponse>>> Post(CreateRelayModuleCropProductionIrrigationSectorCommand command)
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
        [HttpDelete]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<DeleteRelayModuleCropProductionIrrigationSectorResponse>>> Delete(DeleteRelayModuleCropProductionIrrigationSectorCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}