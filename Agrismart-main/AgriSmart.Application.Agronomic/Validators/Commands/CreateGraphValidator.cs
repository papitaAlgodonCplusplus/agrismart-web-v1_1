using AgriSmart.Application.Agronomic.Commands;

using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateGraphValidator : BaseValidator<CreateGraphCommand>
    {
        public CreateGraphValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateGraphCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
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