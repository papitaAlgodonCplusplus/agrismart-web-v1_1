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

        //[Authorize]
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

        //[HttpPost]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status401Unauthorized)]
        //public async Task<ActionResult<Response<CreateCropPhaseOptimalResponse>>> Post(CreateCropPhaseOptimalCommand command)
        //{

        //    var response = await _mediator.Send(command);

        //    if (response.Success)
        //        return Ok(response);

        //    return BadRequest(response);
        //}

        //[HttpPut]
        //[ProducesResponseType(StatusCodes.Status200OK)]
        //[ProducesResponseType(StatusCodes.Status401Unauthorized)]
        //public async Task<ActionResult<Response<UpdateCropPhaseOptimalResponse>>> Put(UpdateCropPhaseOptimalCommand command)
        //{
        //    var response = await _mediator.Send(command);

        //    if (response.Success)
        //        return Ok(response);

        //    return BadRequest(response);
        //}
    }
}