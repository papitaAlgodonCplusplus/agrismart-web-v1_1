
// Agrismart-main/AgriSmart.Application.Agronomic/Commands/
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class DeleteIrrigationEngineeringDesignCommand : IRequest<bool>
    {
        public int Id { get; set; }
        public bool HardDelete { get; set; } = false; // false = soft delete (IsActive = false)
    }
}
