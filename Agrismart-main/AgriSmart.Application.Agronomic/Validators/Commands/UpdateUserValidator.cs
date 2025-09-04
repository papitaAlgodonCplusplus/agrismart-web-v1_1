using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateUserValidator : BaseValidator<UpdateUserCommand>
    {
        public UpdateUserValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateUserCommand command)
        {
            if (string.IsNullOrEmpty(command.Id.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.ProfileId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.ClientId.ToString()))
                return false;
            if (command.UserEmail == null || string.IsNullOrEmpty(command.UserEmail?.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.UserStatusId.ToString()))
                return false;
            return true;
        }
    }
}