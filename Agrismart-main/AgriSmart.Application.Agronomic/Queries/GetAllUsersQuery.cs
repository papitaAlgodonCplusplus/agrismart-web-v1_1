using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllUsersQuery : IRequest<Response<GetAllUsersResponse>>
    {
        public int ProfileId { get; set; } = 0;
        public int ClientId { get; set; } = 0;
        public int UserStatusId { get; set; }
    }
}