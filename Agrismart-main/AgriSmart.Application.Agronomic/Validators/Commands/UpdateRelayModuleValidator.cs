using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateRelayModuleValidator : BaseValidator<UpdateRelayModuleCommand>
    {
        public UpdateRelayModuleValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateRelayModuleCommand command)
        {
            if (string.IsNullOrEmpty(command.Id.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Active.ToString()))
                return false;
            return true;
        }
    }
}