using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteIrrigationDesignCommand : IRequest<bool>
    {
        public int Id { get; set; }
        
        public DeleteIrrigationDesignCommand(int id)
        {
            Id = id;
        }
    }
}