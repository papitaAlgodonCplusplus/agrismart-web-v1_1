using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace AgriSmart.API.Agronomic.Controllers
{
    //[Authorize]
    [ApiController]
    [Route("[controller]")]
    public class MeasurementKPIController : ControllerBase
    {
        private readonly IMediator _mediator;
        public MeasurementKPIController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllMeasurementKPIsResponse>>> Get([FromQuery] GetAllMeasurementKPIsQuery query)
        {
            if (query == null)
                query = new GetAllMeasurementKPIsQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("Latest")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetLatestMeasurementKPIsResponse>>> GetLastest([FromQuery] GetLatestMeasurementKPIsQuery query)
        {
            if (query == null)
                query = new GetLatestMeasurementKPIsQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }


        [HttpPost("batch-insert")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateKPIsResponse>>> Post(CreateKPIsCommand command)
        {
            //_logger.LogInformation(command.ToString());
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }


        //[HttpPost("batch-insert")]
        //public async Task<IActionResult> BatchInsert([FromBody] List<MeasurementKPI> persons)
        //{
        //    if (persons == null || persons.Count == 0)
        //    {
        //        return BadRequest("No data provided");
        //    }

        //    await _context.Persons.AddRangeAsync(persons);  // Batch insert
        //    await _context.SaveChangesAsync();              // Save changes to the database

        //    return Ok(new { message = $"{persons.Count} records inserted successfully." });
        //}
    }
}
