using FluentValidation;
using AgriSmart.Application.Iot.Resources;
using AgriSmart.Application.Iot.Commands;
using AgriSmart.Core.Miscellaneous;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Iot.Validators
{
    public class AuthenticateMqttClientValidator : BaseValidator<AuthenticateMqttClientCommand>
    {
        public AuthenticateMqttClientValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(ValidationMessages.AuthenticateMqttClientError);
        }
        protected override bool AreFiltersValid(AuthenticateMqttClientCommand command)
        {
            if (string.IsNullOrEmpty(command.ConnectUsername))
            {
                return Constants.False;
            }
            if (string.IsNullOrEmpty(command.ConnectPassword))
            {
                return Constants.False;
            }
            return Constants.True;
        }
    }
}
