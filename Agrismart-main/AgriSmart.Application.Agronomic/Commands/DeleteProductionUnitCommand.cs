using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteProductionUnitCommand : IRequest<Response<DeleteProductionUnitResponse>>
    {
        public int Id { get; set; }
    }
}