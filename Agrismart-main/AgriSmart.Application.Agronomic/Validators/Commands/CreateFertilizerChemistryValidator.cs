using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateFertilizerChemistryValidator : BaseValidator<CreateFertilizerChemistryCommand>
    {
        public CreateFertilizerChemistryValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateFertilizerChemistryCommand command)
        {
            if (string.IsNullOrEmpty(command.FertilizerId.ToString()))
                return false;
            return true;
        }
    }
}