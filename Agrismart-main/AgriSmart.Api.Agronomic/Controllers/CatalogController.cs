using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http.Extensions;

namespace AgriSmart.API.Agronomic.Controllers
{
    [Authorize]
    [ApiController]
    [Route("[controller]")]
    public class CatalogController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly ILogger<CatalogController> _logger;
        
        public CatalogController(IMediator mediator, ILogger<CatalogController> logger)
        {
            _mediator = mediator;
            _logger = logger;
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetAllCatalogsResponse>>> GetAll([FromQuery] GetAllCatalogsQuery query)
        {
            try
            {
                _logger.LogInformation("=== CATALOG GET ALL REQUEST ===");
                _logger.LogInformation($"Request URL: {Request.GetDisplayUrl()}");
                _logger.LogInformation($"Query Parameters: {Request.QueryString}");
                _logger.LogInformation($"User: {User?.Identity?.Name ?? "Anonymous"}");
                _logger.LogInformation($"Is Authenticated: {User?.Identity?.IsAuthenticated}");
                
                if (query == null)
                {
                    _logger.LogInformation("Query was null, creating new GetAllCatalogsQuery");
                    query = new GetAllCatalogsQuery();
                }
                else
                {
                    _logger.LogInformation($"Query object: {System.Text.Json.JsonSerializer.Serialize(query)}");
                }

                _logger.LogInformation("Sending query to mediator...");
                var response = await _mediator.Send(query);
                
                _logger.LogInformation($"Mediator response received - Success: {response.Success}");
                
                if (response.Success)
                {
                    _logger.LogInformation("Returning OK response");
                    return Ok(response);
                }

                _logger.LogWarning($"Request failed - returning BadRequest. Response: {System.Text.Json.JsonSerializer.Serialize(response)}");
                return BadRequest(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred in GetAll endpoint");
                throw;
            }
        }

        [Authorize]
        [HttpGet("{Id:int}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<GetCatalogByIdResponse>>> GetById([FromRoute] GetCatalogByIdQuery query)
        {
            try
            {
                _logger.LogInformation("=== CATALOG GET BY ID REQUEST ===");
                _logger.LogInformation($"Request URL: {Request.GetDisplayUrl()}");
                _logger.LogInformation($"Route Parameters: Id = {query?.Id}");
                _logger.LogInformation($"User: {User?.Identity?.Name ?? "Anonymous"}");
                
                if (query == null)
                {
                    _logger.LogInformation("Query was null, creating new GetCatalogByIdQuery");
                    query = new GetCatalogByIdQuery();
                }
                else
                {
                    _logger.LogInformation($"Query object: {System.Text.Json.JsonSerializer.Serialize(query)}");
                }

                _logger.LogInformation("Sending query to mediator...");
                var response = await _mediator.Send(query);
                
                _logger.LogInformation($"Mediator response received - Success: {response.Success}");

                if (response.Success)
                {
                    _logger.LogInformation("Returning OK response");
                    return Ok(response);
                }

                _logger.LogWarning($"Request failed - returning BadRequest. Response: {System.Text.Json.JsonSerializer.Serialize(response)}");
                return BadRequest(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred in GetById endpoint");
                throw;
            }
        }

        [Authorize(Roles = "1")] //only super admin can use this resource
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<CreateCatalogResponse>>> Post(CreateCatalogCommand command)
        {
            try
            {
                _logger.LogInformation("=== CATALOG CREATE REQUEST ===");
                _logger.LogInformation($"Request URL: {Request.GetDisplayUrl()}");
                _logger.LogInformation($"User: {User?.Identity?.Name ?? "Anonymous"}");
                _logger.LogInformation($"User Roles: {string.Join(", ", User?.Claims?.Where(c => c.Type.Contains("role"))?.Select(c => c.Value) ?? new string[0])}");
                _logger.LogInformation($"Command object: {System.Text.Json.JsonSerializer.Serialize(command)}");

                _logger.LogInformation("Sending command to mediator...");
                var response = await _mediator.Send(command);
                
                _logger.LogInformation($"Mediator response received - Success: {response.Success}");

                if (response.Success)
                {
                    _logger.LogInformation("Returning OK response");
                    return Ok(response);
                }

                _logger.LogWarning($"Request failed - returning BadRequest. Response: {System.Text.Json.JsonSerializer.Serialize(response)}");
                return BadRequest(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred in Post endpoint");
                throw;
            }
        }

        [Authorize(Roles = "1")] //only super admin can use this resource
        [HttpPut]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<UpdateCatalogResponse>>> Put(UpdateCatalogCommand command)
        {
            try
            {
                _logger.LogInformation("=== CATALOG UPDATE REQUEST ===");
                _logger.LogInformation($"Request URL: {Request.GetDisplayUrl()}");
                _logger.LogInformation($"User: {User?.Identity?.Name ?? "Anonymous"}");
                _logger.LogInformation($"User Roles: {string.Join(", ", User?.Claims?.Where(c => c.Type.Contains("role"))?.Select(c => c.Value) ?? new string[0])}");
                _logger.LogInformation($"Command object: {System.Text.Json.JsonSerializer.Serialize(command)}");

                _logger.LogInformation("Sending command to mediator...");
                var response = await _mediator.Send(command);
                
                _logger.LogInformation($"Mediator response received - Success: {response.Success}");

                if (response.Success)
                {
                    _logger.LogInformation("Returning OK response");
                    return Ok(response);
                }

                _logger.LogWarning($"Request failed - returning BadRequest. Response: {System.Text.Json.JsonSerializer.Serialize(response)}");
                return BadRequest(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred in Put endpoint");
                throw;
            }
        }
    }
}