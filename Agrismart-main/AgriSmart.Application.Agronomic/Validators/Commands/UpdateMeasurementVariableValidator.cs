using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateMeasurementVariableValidator : BaseValidator<UpdateMeasurementVariableCommand>
    {
        public UpdateMeasurementVariableValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateMeasurementVariableCommand command)
        {
            if (string.IsNullOrEmpty(command.Id.ToString()))
                return false;
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