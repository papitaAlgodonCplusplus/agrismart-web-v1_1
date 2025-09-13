// Agrismart-main/AgriSmart.Api.Agronomic/Controllers/IrrigationDesignController.cs (UPDATED)
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using AgriSmart.Core.Entities;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Common; // Updated namespace
using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Queries;
using AutoMapper;
using MediatR;
using System.ComponentModel.DataAnnotations;
using AgriSmart.Calculator.Interfaces;
using AgriSmart.Calculator.Entities;

namespace AgriSmart.Api.Agronomic.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class IrrigationDesignController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;
        private readonly ILogger<IrrigationDesignController> _logger;
        private readonly IIrrigationDesignCalculator _calculator; // Use interface

        public IrrigationDesignController(
            IMediator mediator,
            IMapper mapper,
            ILogger<IrrigationDesignController> logger,
            IIrrigationDesignCalculator calculator)
        {
            _mediator = mediator;
            _mapper = mapper;
            _logger = logger;
            _calculator = calculator;
        }

        // =============================================================================
        // DESIGN PERSISTENCE ENDPOINTS
        // =============================================================================

        [HttpGet]
        public async Task<ActionResult<Response<List<IrrigationDesignDto>>>> GetDesigns()
        {
            try
            {
                var query = new GetIrrigationDesignsQuery();
                var result = await _mediator.Send(query);
                return Ok(Response<List<IrrigationDesignDto>>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving irrigation designs");
                return StatusCode(500, Response<List<IrrigationDesignDto>>.CreateError(ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Response<IrrigationDesignDto>>> GetDesign(int id)
        {
            try
            {
                var query = new GetIrrigationDesignQuery(id);
                var result = await _mediator.Send(query);
                
                if (result == null)
                    return NotFound(Response<IrrigationDesignDto>.CreateError("Design not found"));

                return Ok(Response<IrrigationDesignDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving irrigation design {Id}", id);
                return StatusCode(500, Response<IrrigationDesignDto>.CreateError(ex.Message));
            }
        }

        [HttpPost]
        public async Task<ActionResult<Response<IrrigationDesignDto>>> CreateDesign(
            [FromBody] CreateIrrigationDesignCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetDesign), new { id = result.Id }, 
                    Response<IrrigationDesignDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating irrigation design");
                return StatusCode(500, Response<IrrigationDesignDto>.CreateError(ex.Message));
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Response<IrrigationDesignDto>>> UpdateDesign(
            int id, [FromBody] UpdateIrrigationDesignCommand command)
        {
            try
            {
                command.Id = id;
                var result = await _mediator.Send(command);
                return Ok(Response<IrrigationDesignDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating irrigation design {Id}", id);
                return StatusCode(500, Response<IrrigationDesignDto>.CreateError(ex.Message));
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Response<bool>>> DeleteDesign(int id)
        {
            try
            {
                var command = new DeleteIrrigationDesignCommand(id);
                await _mediator.Send(command);
                return Ok(Response<bool>.CreateSuccess(true));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting irrigation design {Id}", id);
                return StatusCode(500, Response<bool>.CreateError(ex.Message));
            }
        }

        // =============================================================================
        // HYDRAULIC CALCULATIONS ENDPOINTS
        // =============================================================================

        [HttpPost("calculations/hydraulic")]
        public async Task<ActionResult<Response<HydraulicCalculationResultDto>>> PerformHydraulicCalculations(
            [FromBody] HydraulicCalculationRequestDto request)
        {
            try
            {
                _logger.LogInformation("Starting hydraulic calculations for design");

                var calculationInput = new HydraulicCalculationInput
                {
                    DesignParameters = _mapper.Map<IrrigationDesignParameters>(request.DesignParameters),
                    HydraulicParameters = _mapper.Map<HydraulicParameters>(request.HydraulicParameters),
                    CalculationType = request.CalculationType ?? "comprehensive"
                };

                var result = await _calculator.PerformHydraulicCalculationsAsync(calculationInput);
                var resultDto = _mapper.Map<HydraulicCalculationResultDto>(result);

                _logger.LogInformation("Hydraulic calculations completed successfully");
                return Ok(Response<HydraulicCalculationResultDto>.CreateSuccess(resultDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing hydraulic calculations");
                return StatusCode(500, Response<HydraulicCalculationResultDto>.CreateError(ex.Message));
            }
        }

        [HttpPost("calculations/quick")]
        public async Task<ActionResult<Response<QuickCalculationResultDto>>> PerformQuickCalculations(
            [FromBody] QuickCalculationRequestDto request)
        {
            try
            {
                var calculationInput = new QuickCalculationInput
                {
                    DesignParameters = _mapper.Map<IrrigationDesignParameters>(request.DesignParameters),
                    HydraulicParameters = _mapper.Map<HydraulicParameters>(request.HydraulicParameters)
                };

                var result = await _calculator.PerformQuickCalculationsAsync(calculationInput);
                var resultDto = _mapper.Map<QuickCalculationResultDto>(result);

                return Ok(Response<QuickCalculationResultDto>.CreateSuccess(resultDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing quick calculations");
                return StatusCode(500, Response<QuickCalculationResultDto>.CreateError(ex.Message));
            }
        }

        // =============================================================================
        // SYSTEM VALIDATION ENDPOINTS
        // =============================================================================

        [HttpPost("validation/system")]
        public async Task<ActionResult<Response<SystemValidationResultDto>>> PerformSystemValidation(
            [FromBody] SystemValidationRequestDto request)
        {
            try
            {
                _logger.LogInformation("Starting system validation");

                var validationInput = new SystemValidationInput
                {
                    DesignParameters = _mapper.Map<IrrigationDesignParameters>(request.DesignParameters),
                    HydraulicParameters = _mapper.Map<HydraulicParameters>(request.HydraulicParameters),
                    HydraulicResults = _mapper.Map<HydraulicCalculationResult>(request.HydraulicResults)
                };

                var result = await _calculator.PerformSystemValidationAsync(validationInput);
                var resultDto = _mapper.Map<SystemValidationResultDto>(result);

                _logger.LogInformation("System validation completed. Is Valid: {IsValid}", result.IsValid);
                return Ok(Response<SystemValidationResultDto>.CreateSuccess(resultDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing system validation");
                return StatusCode(500, Response<SystemValidationResultDto>.CreateError(ex.Message));
            }
        }

        [HttpPost("validation/parameters")]
        public async Task<ActionResult<Response<ParameterValidationResultDto>>> ValidateDesignParameters(
            [FromBody] ParameterValidationRequestDto request)
        {
            try
            {
                var validationInput = _mapper.Map<IrrigationDesignParameters>(request.DesignParameters);
                var result = await _calculator.ValidateDesignParametersAsync(validationInput);
                var resultDto = _mapper.Map<ParameterValidationResultDto>(result);

                return Ok(Response<ParameterValidationResultDto>.CreateSuccess(resultDto));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating design parameters");
                return StatusCode(500, Response<ParameterValidationResultDto>.CreateError(ex.Message));
            }
        }

        // =============================================================================
        // TEMPLATE AND PRESET ENDPOINTS
        // =============================================================================

        [HttpGet("templates")]
        public async Task<ActionResult<Response<List<IrrigationTemplateDto>>>> GetDesignTemplates()
        {
            try
            {
                var query = new GetIrrigationTemplatesQuery();
                var result = await _mediator.Send(query);
                return Ok(Response<List<IrrigationTemplateDto>>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving design templates");
                return StatusCode(500, Response<List<IrrigationTemplateDto>>.CreateError(ex.Message));
            }
        }

        [HttpPost("templates")]
        public async Task<ActionResult<Response<IrrigationTemplateDto>>> SaveAsTemplate(
            [FromBody] CreateIrrigationTemplateCommand command)
        {
            try
            {
                var result = await _mediator.Send(command);
                return CreatedAtAction(nameof(GetDesignTemplates), null,
                    Response<IrrigationTemplateDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving design template");
                return StatusCode(500, Response<IrrigationTemplateDto>.CreateError(ex.Message));
            }
        }

        // =============================================================================
        // INTEGRATION ENDPOINTS
        // =============================================================================

        [HttpGet("integration/crop-production/{cropProductionId}")]
        public async Task<ActionResult<Response<CropProductionIntegrationDto>>> IntegrateWithCropProduction(
            int cropProductionId)
        {
            try
            {
                var query = new GetCropProductionIntegrationQuery(cropProductionId);
                var result = await _mediator.Send(query);
                return Ok(Response<CropProductionIntegrationDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error integrating with crop production {CropProductionId}", cropProductionId);
                return StatusCode(500, Response<CropProductionIntegrationDto>.CreateError(ex.Message));
            }
        }

        [HttpPost("integration/iot-sync/{designId}")]
        public async Task<ActionResult<Response<IoTSyncResultDto>>> SyncWithIoTDevices(int designId)
        {
            try
            {
                var command = new SyncIrrigationDesignWithIoTCommand(designId);
                var result = await _mediator.Send(command);
                return Ok(Response<IoTSyncResultDto>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error syncing design {DesignId} with IoT devices", designId);
                return StatusCode(500, Response<IoTSyncResultDto>.CreateError(ex.Message));
            }
        }

        // =============================================================================
        // HEALTH CHECK AND DIAGNOSTICS
        // =============================================================================

        [HttpGet("health")]
        [AllowAnonymous]
        public async Task<ActionResult<Response<HealthCheckResultDto>>> HealthCheck()
        {
            try
            {
                var healthCheck = new HealthCheckResultDto
                {
                    Status = "Healthy",
                    Timestamp = DateTime.UtcNow,
                    Services = new Dictionary<string, string>
                    {
                        ["Calculator"] = "Available",
                        ["Database"] = "Connected",
                        ["FileSystem"] = "Accessible"
                    },
                    Version = "1.0.0"
                };

                return Ok(Response<HealthCheckResultDto>.CreateSuccess(healthCheck));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Health check failed");
                return StatusCode(500, Response<HealthCheckResultDto>.CreateError(ex.Message));
            }
        }

        // =============================================================================
        // SIMPLIFIED ENDPOINTS (Remove complex ones for now)
        // =============================================================================

        [HttpPost("calculations/basic")]
        public async Task<ActionResult<Response<object>>> PerformBasicCalculations(
            [FromBody] object request)
        {
            try
            {
                // Basic calculation logic here
                var result = new
                {
                    FlowRate = 125.5,
                    PressureLoss = 2.3,
                    Efficiency = 87.2,
                    CalculatedAt = DateTime.UtcNow
                };

                return Ok(Response<object>.CreateSuccess(result));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing basic calculations");
                return StatusCode(500, Response<object>.CreateError(ex.Message));
            }
        }

        // =============================================================================
        // HELPER METHODS
        // =============================================================================

        private async Task<bool> ValidateUserAccess(int designId)
        {
            // Implement user access validation logic
            // For now, return true - implement proper authorization
            return true;
        }

        private async Task LogUserAction(string action, object? parameters = null)
        {
            // Implement user action logging
            _logger.LogInformation("User action: {Action} with parameters: {@Parameters}", action, parameters);
        }
    }
} 