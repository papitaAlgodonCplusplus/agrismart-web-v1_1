using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateFertilizerChemistryCommand : IRequest<Response<CreateFertilizerChemistryResponse>>
    {
        public int FertilizerId { get; set; }
        public float Purity { get; set; }
        public float Density { get; set; }
        public float Solubility0 { get; set; }
        public float Solubility20 { get; set; }
        public float Solubility40 { get; set; }
        public string? Formula { get; set; }
        public int Valence { get; set; }
        public bool IsPhAdjuster { get; set; }
    }
}
