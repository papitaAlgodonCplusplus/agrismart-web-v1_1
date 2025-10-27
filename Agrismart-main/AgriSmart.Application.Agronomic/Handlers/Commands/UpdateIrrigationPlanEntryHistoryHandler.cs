

// Agrismart-main/AgriSmart.Application.Agronomic/IrrigationPlanEntryHistories/Handlers/
using AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Commands;
using AgriSmart.Core.Common;
using AgriSmart.Core.DTOs;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Handlers
{
    public class UpdateIrrigationPlanEntryHistoryHandler : IRequestHandler<UpdateIrrigationPlanEntryHistoryCommand, Response<UpdateIrrigationPlanEntryHistoryResponse>>
    {
        private readonly IIrrigationPlanEntryHistoryCommandRepository _commandRepository;
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public UpdateIrrigationPlanEntryHistoryHandler(
            IIrrigationPlanEntryHistoryCommandRepository commandRepository,
            IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<UpdateIrrigationPlanEntryHistoryResponse>> Handle(UpdateIrrigationPlanEntryHistoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var history = await _queryRepository.GetByIdAsync(request.Id);
                if (history == null)
                {
                    return new Response<UpdateIrrigationPlanEntryHistoryResponse>("Irrigation plan entry history not found");
                }

                history.IrrigationPlanEntryId = request.IrrigationPlanEntryId;
                history.IrrigationPlanId = request.IrrigationPlanId;
                history.IrrigationModeId = request.IrrigationModeId;
                history.ExecutionStartTime = request.ExecutionStartTime;
                history.ExecutionEndTime = request.ExecutionEndTime;
                history.PlannedDuration = request.PlannedDuration;
                history.ActualDuration = request.ActualDuration;
                history.ExecutionStatus = request.ExecutionStatus;
                history.Sequence = request.Sequence;
                history.Notes = request.Notes;
                history.ErrorMessage = request.ErrorMessage;
                history.IsManualExecution = request.IsManualExecution;
                history.WaterVolumeDelivered = request.WaterVolumeDelivered;
                history.FlowRate = request.FlowRate;
                history.Pressure = request.Pressure;
                history.Temperature = request.Temperature;
                history.DeviceId = request.DeviceId;
                history.UpdatedBy = request.UpdatedBy;

                var result = await _commandRepository.UpdateAsync(history);

                var response = new UpdateIrrigationPlanEntryHistoryResponse
                {
                    Id = result.Id,
                    ExecutionStatus = result.ExecutionStatus,
                    ExecutionEndTime = result.ExecutionEndTime,
                    ActualDuration = result.ActualDuration
                };

                return new Response<UpdateIrrigationPlanEntryHistoryResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<UpdateIrrigationPlanEntryHistoryResponse>($"Error updating irrigation plan entry history: {ex.Message}");
            }
        }
    }
}