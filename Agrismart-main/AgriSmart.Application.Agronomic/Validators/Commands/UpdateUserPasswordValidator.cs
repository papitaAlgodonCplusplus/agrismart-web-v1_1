using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateUserPasswordValidator : BaseValidator<UpdateUserPasswordCommand>
    {
        public UpdateUserPasswordValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateUserPasswordCommand command)
        {
            if (string.IsNullOrEmpty(command.CurrentPassword.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.NewPassword.ToString()))
                return false;
            return true;
        }
    }
}