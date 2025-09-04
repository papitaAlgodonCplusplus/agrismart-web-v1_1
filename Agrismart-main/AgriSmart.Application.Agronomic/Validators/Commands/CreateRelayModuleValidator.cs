using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateRelayModuleValidator : BaseValidator<CreateRelayModuleCommand>
    {
        public CreateRelayModuleValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateRelayModuleCommand command)
        {
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;         
            return true;
        }
    }
}