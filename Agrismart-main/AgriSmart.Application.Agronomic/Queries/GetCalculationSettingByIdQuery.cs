using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetCalculationSettingByIdQuery : IRequest<Response<GetCalculationSettingByIdResponse>>
    {
        public int Id { get; set; }
    }
}