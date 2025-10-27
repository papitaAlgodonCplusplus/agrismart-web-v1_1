// Agrismart-main/AgriSmart.Api.Agronomic/Controllers/IrrigationPlanEntryHistoryController.cs
using AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Commands;
using AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Queries;
using AgriSmart.Core.Common;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Api.Agronomic.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class IrrigationPlanEntryHistoryController : ControllerBase
    {
        private readonly IMediator _mediator;

        public IrrigationPlanEntryHistoryController(IMediator mediator)
        {
            _mediator = mediator;
        }

        /// <summary>
        /// Get all irrigation plan entry histories
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetAll()
        {
            var query = new GetAllIrrigationPlanEntryHistoriesQuery();
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Get irrigation plan entry history by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Response<IrrigationPlanEntryHistory>>> GetById(int id)
        {
            var query = new GetIrrigationPlanEntryHistoryByIdQuery { Id = id };
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : NotFound(response);
        }

        /// <summary>
        /// Get irrigation plan entry histories by irrigation plan ID
        /// </summary>
        [HttpGet("by-plan/{irrigationPlanId}")]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetByPlanId(int irrigationPlanId)
        {
            var query = new GetIrrigationPlanEntryHistoriesByPlanIdQuery { IrrigationPlanId = irrigationPlanId };
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Get irrigation plan entry histories by irrigation mode ID
        /// </summary>
        [HttpGet("by-mode/{irrigationModeId}")]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetByModeId(int irrigationModeId)
        {
            var query = new GetIrrigationPlanEntryHistoriesByModeIdQuery { IrrigationModeId = irrigationModeId };
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Get irrigation plan entry histories by irrigation plan entry ID
        /// </summary>
        [HttpGet("by-entry/{irrigationPlanEntryId}")]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetByEntryId(int irrigationPlanEntryId)
        {
            var query = new GetIrrigationPlanEntryHistoriesByEntryIdQuery { IrrigationPlanEntryId = irrigationPlanEntryId };
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Get irrigation plan entry histories by date range
        /// </summary>
        [HttpGet("by-date-range")]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var query = new GetIrrigationPlanEntryHistoriesByDateRangeQuery 
            { 
                StartDate = startDate, 
                EndDate = endDate 
            };
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Get irrigation plan entry histories by execution status
        /// </summary>
        [HttpGet("by-status/{executionStatus}")]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetByStatus(string executionStatus)
        {
            var query = new GetIrrigationPlanEntryHistoriesByStatusQuery { ExecutionStatus = executionStatus };
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Get active irrigation executions (InProgress or Scheduled)
        /// </summary>
        [HttpGet("active")]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetActive()
        {
            var query = new GetActiveIrrigationExecutionsQuery();
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Get today's irrigation executions
        /// </summary>
        [HttpGet("today")]
        public async Task<ActionResult<Response<List<IrrigationPlanEntryHistory>>>> GetToday()
        {
            var query = new GetTodayIrrigationExecutionsQuery();
            var response = await _mediator.Send(query);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Create a new irrigation plan entry history
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Response<CreateIrrigationPlanEntryHistoryResponse>>> Create([FromBody] CreateIrrigationPlanEntryHistoryCommand command)
        {
            var response = await _mediator.Send(command);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Update an existing irrigation plan entry history
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Response<UpdateIrrigationPlanEntryHistoryResponse>>> Update(int id, [FromBody] UpdateIrrigationPlanEntryHistoryCommand command)
        {
            if (id != command.Id)
            {
                return BadRequest(new Response<UpdateIrrigationPlanEntryHistoryResponse>("ID mismatch"));
            }

            var response = await _mediator.Send(command);
            return response.Success ? Ok(response) : BadRequest(response);
        }

        /// <summary>
        /// Delete an irrigation plan entry history
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult<Response<bool>>> Delete(int id)
        {
            var command = new DeleteIrrigationPlanEntryHistoryCommand { Id = id };
            var response = await _mediator.Send(command);
            return response.Success ? Ok(response) : BadRequest(response);
        }
    }
}