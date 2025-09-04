using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateIrrigationEventValidator : BaseValidator<CreateIrrigationEventCommand>
    {
        public CreateIrrigationEventValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateIrrigationEventCommand command)
        {
            if (string.IsNullOrEmpty(command.CropProductionId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.RecordDateTime.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.DateTimeStart.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.DateTimeEnd.ToString()))
                return false;

            foreach (CreateIrrigationEventMeasurementCommand irrigationEventMeasurementCommand in command.CreateIrrigationEventMeasurements)
            {
                if (string.IsNullOrEmpty(irrigationEventMeasurementCommand.RecordValue.ToString()))
                    return false;
                if (string.IsNullOrEmpty(irrigationEventMeasurementCommand.MeasurementVariableId.ToString()))
                    return false;
                if (string.IsNullOrEmpty(irrigationEventMeasurementCommand.ToString()))
                    return false;
            }

            return true;
        }
    }
}