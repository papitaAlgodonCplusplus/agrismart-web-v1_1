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
    
    [ApiController]
    [Route("[controller]")]
    public class CompanyController : ControllerBase
    {
        private readonly IMediator _mediator;
        public CompanyController(IMediator mediator)
        {
            _mediator = mediator;
        }

       // [Authorize(Roles = "1,2")]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllCompaniesResponse>>> GetAll([FromQuery] GetAllCompaniesQuery query)
        {

            if (query == null)
                query = new GetAllCompaniesQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpGet("GetById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetCompanyByIdResponse>>> GetById([FromQuery] GetCompanyByIdQuery query)
        {
            if (query == null)
                query = new GetCompanyByIdQuery();

            var response = await _mediator.Send(query);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateCompanyResponse>>> Post(CreateCompanyCommand command)
        {

            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }

        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateCompanyResponse>>> Put(UpdateCompanyCommand command)
        {
            var response = await _mediator.Send(command);

            if (response.Success)
                return Ok(response);

            return BadRequest(response);
        }
    }
}
