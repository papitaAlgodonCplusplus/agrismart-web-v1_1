using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateRelayModuleCropProductionIrrigationSectorValidator : BaseValidator<CreateRelayModuleCropProductionIrrigationSectorCommand>
    {
        public CreateRelayModuleCropProductionIrrigationSectorValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateRelayModuleCropProductionIrrigationSectorCommand command)
        {
            if (string.IsNullOrEmpty(command.UserId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.FarmId.ToString()))
                return false;
            return true;
        }
    }
}