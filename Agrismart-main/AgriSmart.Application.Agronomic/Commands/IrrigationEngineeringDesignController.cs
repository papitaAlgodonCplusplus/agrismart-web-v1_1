// Agrismart-main/AgriSmart.Api.Agronomic/Controllers/IrrigationEngineeringDesignController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Common;
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AutoMapper;
using MediatR;
using Microsoft.Extensions.Logging;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace AgriSmart.Api.Agronomic.Controllers
{
    /// <summary>
    /// Controller for managing irrigation engineering designs with comprehensive CRUD operations
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    [Produces("application/json")]
    public class IrrigationEngineeringDesignController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly ILogger<IrrigationEngineeringDesignController> _logger;

        public IrrigationEngineeringDesignController(
            IMediator mediator,
            IMapper mapper,
            ILogger<IrrigationEngineeringDesignController> logger)
        {
            _mediator = mediator;
            _mapper = mapper;
            _logger = logger;
        }

        // =============================================================================
        // GET OPERATIONS
        // =============================================================================

        /// <summary>
        /// Get all irrigation engineering designs with filtering and pagination
        /// </summary>
        /// <param name="clientId">Filter by client ID</param>
        /// <param name="farmId">Filter by farm ID</param>
        /// <param name="cropProductionId">Filter by crop production ID</param>
        /// <param name="designType">Filter by design type (drip, sprinkler, micro-sprinkler)</param>
        /// <param name="status">Filter by status (draft, completed, approved, rejected)</param>
        /// <param name="searchTerm">Search in name, description, and tags</param>
        /// <param name="isActive">Filter by active status</param>
        /// <param name="isTemplate">Filter by template status</param>
        /// <param name="requiresRecalculation">Filter by recalculation requirement</param>
        /// <param name="createdAfter">Filter by creation date (after)</param>
        /// <param name="createdBefore">Filter by creation date (before)</param>
        /// <param name="minArea">Minimum total area filter</param>
        /// <param name="maxArea">Maximum total area filter</param>
        /// <param name="minCost">Minimum cost filter</param>
        /// <param name="maxCost">Maximum cost filter</param>
        /// <param name="isHydraulicallyValid">Filter by hydraulic validation status</param>
        /// <param name="isEconomicallyViable">Filter by economic viability status</param>
        /// <param name="tags">Filter by tags</param>
        /// <param name="pageNumber">Page number (default: 1)</param>
        /// <param name="pageSize">Page size (default: 50, max: 500)</param>
        /// <param name="sortBy">Sort field (name, area, cost, status, createdAt)</param>
        /// <param name="sortDirection">Sort direction (asc, desc)</param>
        /// <returns>List of irrigation engineering designs</returns>
        [HttpGet]
        [ProducesResponseType(typeof(Response<List<IrrigationEngineeringDesignDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<List<IrrigationEngineeringDesignDto>>>> GetDesigns(
            [FromQuery] int? clientId = null,
            [FromQuery] int? farmId = null,
            [FromQuery] int? cropProductionId = null,
            [FromQuery] string? designType = null,
            [FromQuery] string? status = null,
            [FromQuery] string? searchTerm = null,
            [FromQuery] bool? isActive = true,
            [FromQuery] bool? isTemplate = null,
            [FromQuery] bool? requiresRecalculation = null,
            [FromQuery] DateTime? createdAfter = null,
            [FromQuery] DateTime? createdBefore = null,
            [FromQuery] decimal? minArea = null,
            [FromQuery] decimal? maxArea = null,
            [FromQuery] decimal? minCost = null,
            [FromQuery] decimal? maxCost = null,
            [FromQuery] bool? isHydraulicallyValid = null,
            [FromQuery] bool? isEconomicallyViable = null,
            [FromQuery] string? tags = null,
            [FromQuery, Range(1, int.MaxValue)] int pageNumber = 1,
            [FromQuery, Range(1, 500)] int pageSize = 50,
            [FromQuery] string? sortBy = "CreatedAt",
            [FromQuery] string? sortDirection = "desc")
        {
            try
            {
                var query = new GetIrrigationEngineeringDesignsQuery
                {
                    ClientId = clientId,
                    FarmId = farmId,
                    CropProductionId = cropProductionId,
                    DesignType = designType,
                    Status = status,
                    SearchTerm = searchTerm,
                    IsActive = isActive,
                    IsTemplate = isTemplate,
                    RequiresRecalculation = requiresRecalculation,
                    CreatedAfter = createdAfter,
                    CreatedBefore = createdBefore,
                    MinArea = minArea,
                    MaxArea = maxArea,
                    MinCost = minCost,
                    MaxCost = maxCost,
                    IsHydraulicallyValid = isHydraulicallyValid,
                    IsEconomicallyViable = isEconomicallyViable,
                    Tags = tags,
                    PageNumber = pageNumber,
                    PageSize = pageSize,
                    SortBy = sortBy,
                    SortDirection = sortDirection
                };

                var result = await _mediator.Send(query);

                _logger.LogInformation("Retrieved {Count} irrigation designs for page {Page}", result.Count, pageNumber);

                return Ok(Response<List<IrrigationEngineeringDesignDto>>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving irrigation designs");
                return BadRequest(Response<object>.CreateError($"Error retrieving designs: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get a specific irrigation engineering design by ID
        /// </summary>
        /// <param name="id">Design ID</param>
        /// <param name="includeInactive">Include inactive designs</param>
        /// <returns>Detailed irrigation engineering design</returns>
        [HttpGet("{id:int}")]
        [ProducesResponseType(typeof(Response<IrrigationEngineeringDesignDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<IrrigationEngineeringDesignDetailDto>>> GetDesignById(
            [FromRoute] int id,
            [FromQuery] bool includeInactive = false)
        {
            try
            {
                var query = new GetIrrigationEngineeringDesignByIdQuery
                {
                    Id = id,
                    IncludeInactive = includeInactive
                };

                var result = await _mediator.Send(query);

                if (result == null)
                {
                    _logger.LogWarning("Irrigation design with ID {Id} not found", id);
                    return NotFound(Response<object>.CreateError($"Design with ID {id} not found"));
                }

                _logger.LogInformation("Retrieved irrigation design {Id}: {Name}", id, result.Name);

                return Ok(Response<IrrigationEngineeringDesignDetailDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving irrigation design {Id}", id);
                return BadRequest(Response<object>.CreateError($"Error retrieving design: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get irrigation design templates
        /// </summary>
        /// <param name="designType">Filter by design type</param>
        /// <param name="publicOnly">Only public templates</param>
        /// <param name="createdBy">Filter by creator</param>
        /// <param name="searchTerm">Search term</param>
        /// <returns>List of design templates</returns>
        [HttpGet("templates")]
        [ProducesResponseType(typeof(Response<List<IrrigationEngineeringDesignDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<List<IrrigationEngineeringDesignDto>>>> GetTemplates(
            [FromQuery] string? designType = null,
            [FromQuery] bool publicOnly = false,
            [FromQuery] int? createdBy = null,
            [FromQuery] string? searchTerm = null)
        {
            try
            {
                var query = new GetIrrigationDesignTemplatesQuery
                {
                    DesignType = designType,
                    PublicOnly = publicOnly,
                    CreatedBy = createdBy,
                    SearchTerm = searchTerm
                };

                var result = await _mediator.Send(query);

                _logger.LogInformation("Retrieved {Count} irrigation design templates", result.Count);

                return Ok(Response<List<IrrigationEngineeringDesignDto>>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving irrigation design templates");
                return BadRequest(Response<object>.CreateError($"Error retrieving templates: {ex.Message}"));
            }
        }

        /// <summary>
        /// Get irrigation design summary statistics
        /// </summary>
        /// <param name="clientId">Filter by client</param>
        /// <param name="farmId">Filter by farm</param>
        /// <param name="fromDate">Date range start</param>
        /// <param name="toDate">Date range end</param>
        /// <param name="includeInactive">Include inactive designs</param>
        /// <returns>Summary statistics</returns>
        [HttpGet("summary")]
        [ProducesResponseType(typeof(Response<IrrigationDesignSummaryDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<IrrigationDesignSummaryDto>>> GetSummary(
            [FromQuery] int? clientId = null,
            [FromQuery] int? farmId = null,
            [FromQuery] DateTime? fromDate = null,
            [FromQuery] DateTime? toDate = null,
            [FromQuery] bool includeInactive = false)
        {
            try
            {
                var query = new GetIrrigationDesignSummaryQuery
                {
                    ClientId = clientId,
                    FarmId = farmId,
                    FromDate = fromDate,
                    ToDate = toDate,
                    IncludeInactive = includeInactive
                };

                var result = await _mediator.Send(query);

                _logger.LogInformation("Retrieved irrigation design summary for client {ClientId}", clientId);

                return Ok(Response<IrrigationDesignSummaryDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving irrigation design summary");
                return BadRequest(Response<object>.CreateError($"Error retrieving summary: {ex.Message}"));
            }
        }

        // =============================================================================
        // POST OPERATIONS
        // =============================================================================

        /// <summary>
        /// Create a new irrigation engineering design
        /// </summary>
        /// <param name="createDto">Design creation data</param>
        /// <returns>Created design</returns>
        [HttpPost]
        [ProducesResponseType(typeof(Response<IrrigationEngineeringDesignDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<IrrigationEngineeringDesignDto>>> CreateDesign(
            [FromBody] CreateIrrigationEngineeringDesignDto createDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Response<object>.CreateError($"Validation errors: {string.Join(", ", errors)}"));
                }

                var userId = GetCurrentUserId();
                if (userId == 0)
                    return BadRequest(Response<object>.CreateError("Unable to determine current user"));

                var command = _mapper.Map<CreateIrrigationEngineeringDesignCommand>(createDto);
                command.CreatedBy = userId;

                var result = await _mediator.Send(command);

                _logger.LogInformation("Created irrigation design {Id}: {Name} by user {UserId}",
                    result.Id, result.Name, userId);

                return CreatedAtAction(
                    nameof(GetDesignById),
                    new { id = result.Id },
                    Response<IrrigationEngineeringDesignDto>.CreateSuccess(result));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument in create design request");
                return BadRequest(Response<object>.CreateError(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating irrigation design");
                var errorMsg = ex.InnerException != null
                    ? $"Error creating design: {ex.Message} | Inner: {ex.InnerException.Message}"
                    : $"Error creating design: {ex.Message}";
                return BadRequest(Response<object>.CreateError(errorMsg));
            }
        }

        /// <summary>
        /// Calculate or recalculate irrigation design parameters
        /// </summary>
        /// <param name="id">Design ID</param>
        /// <param name="calculationRequest">Calculation parameters</param>
        /// <returns>Calculation results</returns>
        [HttpPost("{id:int}/calculate")]
        [ProducesResponseType(typeof(Response<IrrigationDesignCalculationResultDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<IrrigationDesignCalculationResultDto>>> CalculateDesign(
            [FromRoute] int id,
            [FromBody] IrrigationDesignCalculationRequestDto calculationRequest)
        {
            try
            {
                if (calculationRequest.DesignId != id)
                    return BadRequest(Response<object>.CreateError("Design ID mismatch"));

                var userId = GetCurrentUserId();
                if (userId == 0)
                    return BadRequest(Response<object>.CreateError("Unable to determine current user"));

                var command = new CalculateIrrigationEngineeringDesignCommand
                {
                    DesignId = id,
                    RecalculateHydraulics = calculationRequest.RecalculateHydraulics,
                    RecalculateEconomics = calculationRequest.RecalculateEconomics,
                    RecalculatePerformance = calculationRequest.RecalculatePerformance,
                    RunOptimization = calculationRequest.RunOptimization,
                    CalculationNotes = calculationRequest.CalculationNotes,
                    RequestedBy = userId
                };

                var result = await _mediator.Send(command);

                _logger.LogInformation("Calculated irrigation design {Id} by user {UserId}. Success: {Success}",
                    id, userId, result.Success);

                return Ok(Response<IrrigationDesignCalculationResultDto>.CreateSuccess(result));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument in calculate design request for ID {Id}", id);
                return BadRequest(Response<object>.CreateError(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error calculating irrigation design {Id}", id);
                return BadRequest(Response<object>.CreateError($"Error calculating design: {ex.Message}"));
            }
        }

        // =============================================================================
        // PUT OPERATIONS
        // =============================================================================

        /// <summary>
        /// Update an existing irrigation engineering design
        /// </summary>
        /// <param name="id">Design ID</param>
        /// <param name="updateDto">Design update data</param>
        /// <returns>Updated design</returns>
        [HttpPut("{id:int}")]
        [ProducesResponseType(typeof(Response<IrrigationEngineeringDesignDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<IrrigationEngineeringDesignDto>>> UpdateDesign(
            [FromRoute] int id,
            [FromBody] UpdateIrrigationEngineeringDesignDto updateDto)
        {
            try
            {
                if (updateDto.Id != id)
                    return BadRequest(Response<object>.CreateError("Design ID mismatch"));

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    return BadRequest(Response<object>.CreateError($"Validation errors: {string.Join(", ", errors)}"));
                }

                var userId = GetCurrentUserId();
                if (userId == 0)
                    return BadRequest(Response<object>.CreateError("Unable to determine current user"));

                var command = _mapper.Map<UpdateIrrigationEngineeringDesignCommand>(updateDto);
                command.UpdatedBy = userId;

                var result = await _mediator.Send(command);

                _logger.LogInformation("Updated irrigation design {Id}: {Name} by user {UserId}",
                    result.Id, result.Name, userId);

                return Ok(Response<IrrigationEngineeringDesignDto>.CreateSuccess(result));
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, "Invalid argument in update design request for ID {Id}", id);
                return BadRequest(Response<object>.CreateError(ex.Message));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating irrigation design {Id}", id);
                return BadRequest(Response<object>.CreateError($"Error updating design: {ex.Message}"));
            }
        }

        // =============================================================================
        // DELETE OPERATIONS
        // =============================================================================

        /// <summary>
        /// Delete (soft delete by default) an irrigation engineering design
        /// </summary>
        /// <param name="id">Design ID</param>
        /// <param name="hardDelete">True for permanent deletion, false for soft delete</param>
        /// <returns>Success status</returns>
        [HttpDelete("{id:int}")]
        [ProducesResponseType(typeof(Response<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Response<bool>>> DeleteDesign(
            [FromRoute] int id,
            [FromQuery] bool hardDelete = false)
        {
            try
            {
                var command = new DeleteIrrigationEngineeringDesignCommand
                {
                    Id = id,
                    HardDelete = hardDelete
                };

                var result = await _mediator.Send(command);

                if (!result)
                {
                    _logger.LogWarning("Irrigation design with ID {Id} not found for deletion", id);
                    return NotFound(Response<object>.CreateError($"Design with ID {id} not found"));
                }

                var userId = GetCurrentUserId();
                _logger.LogInformation("Deleted irrigation design {Id} by user {UserId}. Hard delete: {HardDelete}",
                    id, userId, hardDelete);

                return Ok(Response<bool>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting irrigation design {Id}", id);
                return BadRequest(Response<object>.CreateError($"Error deleting design: {ex.Message}"));
            }
        }

        // =============================================================================
        // BULK OPERATIONS
        // =============================================================================

        /// <summary>
        /// Bulk update design statuses
        /// </summary>
        /// <param name="ids">Design IDs</param>
        /// <param name="status">New status</param>
        /// <returns>Success status</returns>
        [HttpPatch("bulk/status")]
        [ProducesResponseType(typeof(Response<int>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<int>>> BulkUpdateStatus(
            [FromBody] List<int> ids,
            [FromQuery, Required] string status)
        {
            try
            {
                if (!ids.Any())
                    return BadRequest(Response<object>.CreateError("No design IDs provided"));

                var validStatuses = new[] { "draft", "completed", "approved", "rejected" };
                if (!validStatuses.Contains(status.ToLower()))
                    return BadRequest(Response<object>.CreateError($"Invalid status. Valid values: {string.Join(", ", validStatuses)}"));

                var userId = GetCurrentUserId();
                var updatedCount = 0;

                foreach (var id in ids)
                {
                    try
                    {
                        // Get the current design to update only the status
                        var query = new GetIrrigationEngineeringDesignByIdQuery { Id = id };
                        var design = await _mediator.Send(query);

                        if (design != null)
                        {
                            var updateCommand = _mapper.Map<UpdateIrrigationEngineeringDesignCommand>(design);
                            updateCommand.Status = status;
                            updateCommand.UpdatedBy = userId;

                            await _mediator.Send(updateCommand);
                            updatedCount++;
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to update status for design {Id}", id);
                    }
                }

                _logger.LogInformation("Bulk updated status to {Status} for {Count}/{Total} designs by user {UserId}",
                    status, updatedCount, ids.Count, userId);

                return Ok(Response<int>.CreateSuccess(updatedCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk status update");
                return BadRequest(Response<object>.CreateError($"Error updating statuses: {ex.Message}"));
            }
        }

        /// <summary>
        /// Bulk recalculation trigger
        /// </summary>
        /// <param name="ids">Design IDs</param>
        /// <returns>Number of designs marked for recalculation</returns>
        [HttpPost("bulk/recalculate")]
        [ProducesResponseType(typeof(Response<int>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(Response<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public async Task<ActionResult<Response<int>>> BulkTriggerRecalculation([FromBody] List<int> ids)
        {
            try
            {
                if (!ids.Any())
                    return BadRequest(Response<object>.CreateError("No design IDs provided"));

                var userId = GetCurrentUserId();
                var triggeredCount = 0;

                foreach (var id in ids)
                {
                    try
                    {
                        var command = new CalculateIrrigationEngineeringDesignCommand
                        {
                            DesignId = id,
                            RecalculateHydraulics = true,
                            RecalculateEconomics = true,
                            RecalculatePerformance = true,
                            RunOptimization = false,
                            RequestedBy = userId
                        };

                        await _mediator.Send(command);
                        triggeredCount++;
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to trigger recalculation for design {Id}", id);
                    }
                }

                _logger.LogInformation("Bulk triggered recalculation for {Count}/{Total} designs by user {UserId}",
                    triggeredCount, ids.Count, userId);

                return Ok(Response<int>.CreateSuccess(triggeredCount));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in bulk recalculation trigger");
                return BadRequest(Response<object>.CreateError($"Error triggering recalculations: {ex.Message}"));
            }
        }

        // =============================================================================
        // UTILITY METHODS
        // =============================================================================

        /// <summary>
        /// Get the current user ID from the JWT token
        /// </summary>
        /// <returns>User ID or 0 if not found</returns>
        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                             ?? User.FindFirst("sub")?.Value
                             ?? User.FindFirst("id")?.Value
                             ?? User.FindFirst("userId")?.Value;

            return int.TryParse(userIdClaim, out var userId) ? userId : 0;
        }
    }
}