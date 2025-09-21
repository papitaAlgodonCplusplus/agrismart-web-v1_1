using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteDeviceValidator : BaseValidator<DeleteDeviceCommand>
    {
        public DeleteDeviceValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteDeviceCommand command)
        {
            if (command.Id <= 0)
                return false;
            return true;
        }
    }
}