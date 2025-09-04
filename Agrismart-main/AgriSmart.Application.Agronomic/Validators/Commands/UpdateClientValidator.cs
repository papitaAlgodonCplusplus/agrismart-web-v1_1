using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateClientValidator : BaseValidator<UpdateClientCommand>
    {
        public UpdateClientValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateClientCommand command)
        {
            if (string.IsNullOrEmpty(command.Id.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.Description == null || string.IsNullOrEmpty(command.Description?.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Active.ToString()))
                return false;
            return true;
        }
    }
}