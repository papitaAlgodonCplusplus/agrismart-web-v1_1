using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateAnaliticalEntityValidator : BaseValidator<UpdateAnaliticalEntityCommand>
    {
        public UpdateAnaliticalEntityValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateAnaliticalEntityCommand command)
        {
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.Script == null || string.IsNullOrEmpty(command.Script?.ToString()))
                return false;
            if (command.EntityType == null || string.IsNullOrEmpty(command.EntityType.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Active.ToString()))
                return false;
            return true;
        }
    }
}