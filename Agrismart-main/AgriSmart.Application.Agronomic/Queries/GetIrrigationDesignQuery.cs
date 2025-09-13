using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public class GetIrrigationDesignQuery : IRequest<IrrigationDesignDto>
    {
        public int Id { get; set; }
        
        public GetIrrigationDesignQuery(int id)
        {
            Id = id;
        }
    }
}