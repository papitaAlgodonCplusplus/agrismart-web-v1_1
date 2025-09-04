using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllUserFarmsQuery : IRequest<Response<GetAllUserFarmsResponse>>
    {
        public int UserId { get; set; } = 0;
    }
}