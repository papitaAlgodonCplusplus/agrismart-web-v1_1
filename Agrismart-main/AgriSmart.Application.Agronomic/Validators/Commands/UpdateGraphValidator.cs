using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateGraphValidator : BaseValidator<UpdateGraphCommand>
    {
        public UpdateGraphValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateGraphCommand command)
        {
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            if (command.Series == null || string.IsNullOrEmpty(command.Series?.ToString()))
                return false;
            if (command.SummaryTimeScale == null || string.IsNullOrEmpty(command.SummaryTimeScale?.ToString()))
                return false;
            if (command.YAxisScaleType == null || string.IsNullOrEmpty(command.YAxisScaleType?.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.Active.ToString()))
                return false;
            return true;
        }
    }
}