using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateUserValidator : BaseValidator<CreateUserCommand>
    {
        public CreateUserValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateUserCommand command)
        {
            if (string.IsNullOrEmpty(command.ProfileId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.ClientId.ToString()))
                return false;
            if (command.UserEmail == null || string.IsNullOrEmpty(command.UserEmail?.ToString()))
                return false;
            return true;
        }
    }
}