using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateMeasurementVariableValidator : BaseValidator<CreateMeasurementVariableCommand>
    {
        public CreateMeasurementVariableValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateMeasurementVariableCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.MeasurementUnitId == null)
                return false;
            if (command.MeasurementVariableStandardId == null)
                return false;
            return true;
        }
    }
}