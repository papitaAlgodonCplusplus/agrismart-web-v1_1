
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
    public class DeleteIrrigationPlanEntryHistoryHandler : IRequestHandler<DeleteIrrigationPlanEntryHistoryCommand, Response<bool>>
    {
        private readonly IIrrigationPlanEntryHistoryCommandRepository _commandRepository;
        private readonly IIrrigationPlanEntryHistoryQueryRepository _queryRepository;

        public DeleteIrrigationPlanEntryHistoryHandler(
            IIrrigationPlanEntryHistoryCommandRepository commandRepository,
            IIrrigationPlanEntryHistoryQueryRepository queryRepository)
        {
            _commandRepository = commandRepository;
            _queryRepository = queryRepository;
        }

        public async Task<Response<bool>> Handle(DeleteIrrigationPlanEntryHistoryCommand request, CancellationToken cancellationToken)
        {
            try
            {
                var history = await _queryRepository.GetByIdAsync(request.Id);
                if (history == null)
                {
                    return new Response<bool>("Irrigation plan entry history not found");
                }

                await _commandRepository.DeleteAsync(history);
                return new Response<bool>(true);
            }
            catch (Exception ex)
            {
                return new Response<bool>($"Error deleting irrigation plan entry history: {ex.Message}");
            }
        }
    }
}