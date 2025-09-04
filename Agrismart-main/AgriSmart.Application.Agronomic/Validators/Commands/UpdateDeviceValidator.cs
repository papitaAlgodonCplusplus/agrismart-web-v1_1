using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateDeviceValidator : BaseValidator<UpdateDeviceCommand>
    {
        public UpdateDeviceValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateDeviceCommand command)
        {
            if (string.IsNullOrEmpty(command.Id.ToString()))
                return false;
            if (command.DeviceId == null || string.IsNullOrEmpty(command.DeviceId?.ToString()))
                return false;
            return true;
        }
    }
}