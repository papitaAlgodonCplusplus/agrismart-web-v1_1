using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateCropPhaseSolutionRequirementCommand : IRequest<Response<CreateCropPhaseSolutionRequirementResponse>>
    {
        public int? CropPhaseId { get; set; }
        public int PhaseId { get; set; }
        public double EC { get; set; }
        public double HCO3 { get; set; }
        public double NO3 { get; set; }
        public double H2PO4 { get; set; }
        public double SO4 { get; set; }
        public double Cl { get; set; }
        public double NH4 { get; set; }
        public double K { get; set; }
        public double Ca { get; set; }
        public double Mg { get; set; }
        public double Na { get; set; }
        public double? Fe { get; set; }
        public double? Mn { get; set; }
        public double? Zn { get; set; }
        public double? Cu { get; set; }
        public double? B { get; set; }
        public double? Mo { get; set; }
        public double? pH { get; set; }
        public double? Temperature { get; set; }
        public string? Notes { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; } = true;
        public int CreatedBy { get; set; }
    }
}