using FluentValidation;
using AgriSmart.Application.Iot.Resources;
using AgriSmart.Application.Iot.Commands;
using AgriSmart.Core.Miscellaneous;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Iot.Validators
{
    public class AuthenticateDeviceValidator : BaseValidator<AuthenticateDeviceCommand>
    {
        public AuthenticateDeviceValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(ValidationMessages.AuthenticateDeviceError);
        }
        protected override bool AreFiltersValid(AuthenticateDeviceCommand command)
        {
            if (string.IsNullOrEmpty(command.DeviceId))
            {
                return Constants.False;
            }
            if (string.IsNullOrEmpty(command.Password))
            {
                return Constants.False;
            }
            return Constants.True;
        }
    }
}
