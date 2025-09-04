using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteMeasurementKPIsValidator : BaseValidator<DeleteMeasurementKPIsCommand>
    {
        public DeleteMeasurementKPIsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteMeasurementKPIsCommand command)
        {
            if (string.IsNullOrEmpty(command.CropProductionId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.StartDateTime.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.EndDateTime.ToString()))
                return false;
            return true;
        }
    }
}