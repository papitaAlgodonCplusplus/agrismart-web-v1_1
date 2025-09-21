using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteCalculationSettingCommand : IRequest<Response<DeleteCalculationSettingResponse>>
    {
        public int Id { get; set; }
    }
}