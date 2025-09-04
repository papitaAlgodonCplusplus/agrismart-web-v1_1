using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateFertilizerChemistryValidator : BaseValidator<UpdateFertilizerChemistryCommand>
    {
        public UpdateFertilizerChemistryValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateFertilizerChemistryCommand command)
        {
            if (string.IsNullOrEmpty(command.FertilizerId.ToString()))
                return false;
            return true;
        }
    }
}