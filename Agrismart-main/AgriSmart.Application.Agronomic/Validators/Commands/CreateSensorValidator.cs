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
            if (string.IsNullOrEmpty(command.DeviceId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.SensorLabel.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Description.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.MeasurementVariableId.ToString()))
                return false;
            return true;
        }
    }
}