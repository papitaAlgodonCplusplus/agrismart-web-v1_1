using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteUserFarmCommand : IRequest<Response<DeleteUserFarmResponse>>
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
    }
}