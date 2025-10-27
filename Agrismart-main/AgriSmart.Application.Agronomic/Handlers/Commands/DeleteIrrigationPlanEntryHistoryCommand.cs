
// Agrismart-main/AgriSmart.Application.Agronomic/IrrigationPlanEntryHistories/Commands/
using AgriSmart.Core.Common;
using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.IrrigationPlanEntryHistories.Commands
{
    public class DeleteIrrigationPlanEntryHistoryCommand : IRequest<Response<bool>>
    {
        public int Id { get; set; }
    }
}