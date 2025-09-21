using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteUserValidator : BaseValidator<DeleteUserCommand>
    {
        public DeleteUserValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteUserCommand command)
        {
            if (command.Id <= 0)
                return false;
            return true;
        }
    }
}