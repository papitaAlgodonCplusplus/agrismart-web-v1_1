using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateSoilAnalysisValidator : BaseValidator<UpdateSoilAnalysisCommand>
    {
        public UpdateSoilAnalysisValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateSoilAnalysisCommand command)
        {
            if (command.Id <= 0)
                return false;
            if (command.CropProductionId <= 0)
                return false;
            if (command.SampleDate == default)
                return false;
            return true;
        }
    }
}
