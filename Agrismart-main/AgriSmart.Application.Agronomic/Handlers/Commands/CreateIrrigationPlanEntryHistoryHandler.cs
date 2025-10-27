// Agrismart-main/AgriSmart.Application.Agronomic/IrrigationPlanEntryHistories/Handlers/CreateIrrigationPlanEntryHistoryHandler.cs
using AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Commands;
using AgriSmart.Core.Common;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Handlers
{
    public class CreateIrrigationPlanEntryHistoryHandler : IRequestHandler<CreateIrrigationPlanEntryHistoryCommand, Response<CreateIrrigationPlanEntryHistoryResponse>>
    {
        private readonly IIrrigationPlanEntryHistoryCommandRepository _commandRepository;

        public CreateIrrigationPlanEntryHistoryHandler(IIrrigationPlanEntryHistoryCommandRepository commandRepository)
        {
            _commandRepository = commandRepository;
        }

        public async Task<Response<CreateIrrigationPlanEntryHistoryResponse>> Handle(CreateIrrigationPlanEntryHistoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var history = new IrrigationPlanEntryHistory
                {
                    IrrigationPlanEntryId = request.IrrigationPlanEntryId,
                    IrrigationPlanId = request.IrrigationPlanId,
                    IrrigationModeId = request.IrrigationModeId,
                    ExecutionStartTime = request.ExecutionStartTime,
                    ExecutionEndTime = request.ExecutionEndTime,
                    PlannedDuration = request.PlannedDuration,
                    ActualDuration = request.ActualDuration,
                    ExecutionStatus = request.ExecutionStatus,
                    Sequence = request.Sequence,
                    Notes = request.Notes,
                    ErrorMessage = request.ErrorMessage,
                    IsManualExecution = request.IsManualExecution,
                    WaterVolumeDelivered = request.WaterVolumeDelivered,
                    FlowRate = request.FlowRate,
                    Pressure = request.Pressure,
                    Temperature = request.Temperature,
                    DeviceId = request.DeviceId,
                    DateCreated = DateTime.UtcNow,
                    CreatedBy = request.CreatedBy
                };

                var result = await _commandRepository.AddAsync(history);

                var response = new CreateIrrigationPlanEntryHistoryResponse
                {
                    Id = result.Id,
                    IrrigationPlanEntryId = result.IrrigationPlanEntryId,
                    IrrigationPlanId = result.IrrigationPlanId,
                    IrrigationModeId = result.IrrigationModeId,
                    ExecutionStartTime = result.ExecutionStartTime,
                    ExecutionStatus = result.ExecutionStatus,
                    PlannedDuration = result.PlannedDuration
                };

                return new Response<CreateIrrigationPlanEntryHistoryResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<CreateIrrigationPlanEntryHistoryResponse>($"Error creating irrigation plan entry history: {ex.Message}");
            }
        }
    }
}