using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateSensorValidator : BaseValidator<CreateSensorCommand>
    {
        public CreateSensorValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateSensorCommand command)
        {
            if (command.DeviceId <= 0)
                return false;
            if (string.IsNullOrWhiteSpace(command.SensorLabel))
                return false;
            if (string.IsNullOrWhiteSpace(command.Description))
                return false;
            return true;
        }
    }
}