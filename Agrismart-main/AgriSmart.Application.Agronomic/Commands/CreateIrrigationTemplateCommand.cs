using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateIrrigationTemplateCommand : IRequest<IrrigationTemplateDto>
    {
        public IrrigationTemplateDto IrrigationTemplate { get; set; }
        
        public CreateIrrigationTemplateCommand(IrrigationTemplateDto irrigationTemplate)
        {
            IrrigationTemplate = irrigationTemplate;
        }
    }
}