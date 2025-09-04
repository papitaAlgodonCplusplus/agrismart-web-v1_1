using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateCropProductionIrrigationSectorValidator : BaseValidator<CreateCropProductionIrrigationSectorCommand>
    {
        public CreateCropProductionIrrigationSectorValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateCropProductionIrrigationSectorCommand command)
        {
            if (string.IsNullOrEmpty(command.CropProductionId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;            
            return true;
        }
    }
}