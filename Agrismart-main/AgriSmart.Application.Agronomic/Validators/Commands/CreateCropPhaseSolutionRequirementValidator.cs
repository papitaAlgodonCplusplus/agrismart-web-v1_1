using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateCropPhaseSolutionRequirementValidator : BaseValidator<CreateCropPhaseSolutionRequirementCommand>
    {
        public CreateCropPhaseSolutionRequirementValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateCropPhaseSolutionRequirementCommand command)
        {
            if (command.PhaseId <= 0)
                return false;
            if (command.CreatedBy <= 0)
                return false;
            if (command.EC < 0)
                return false;
            return true;
        }
    }
}