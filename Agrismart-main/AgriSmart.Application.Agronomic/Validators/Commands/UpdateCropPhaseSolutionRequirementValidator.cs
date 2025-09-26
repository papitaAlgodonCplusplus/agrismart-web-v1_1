using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class UpdateCropPhaseSolutionRequirementValidator : BaseValidator<UpdateCropPhaseSolutionRequirementCommand>
    {
        public UpdateCropPhaseSolutionRequirementValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(UpdateCropPhaseSolutionRequirementCommand command)
        {
            if (command.Id <= 0)
                return false;
            if (command.PhaseId <= 0)
                return false;
            if (command.UpdatedBy <= 0)
                return false;
            if (command.EC < 0)
                return false;
            return true;
        }
    }
}