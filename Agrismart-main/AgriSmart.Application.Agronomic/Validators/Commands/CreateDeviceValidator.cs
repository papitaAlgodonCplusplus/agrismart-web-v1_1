using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateDeviceValidator : BaseValidator<CreateDeviceCommand>
    {
        public CreateDeviceValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateDeviceCommand command)
        {
            if (string.IsNullOrEmpty(command.CompanyId.ToString()))
                return false;
            if (command.DeviceId == null || string.IsNullOrEmpty(command.DeviceId?.ToString()))
                return false;           
            return true;
        }
    }
}