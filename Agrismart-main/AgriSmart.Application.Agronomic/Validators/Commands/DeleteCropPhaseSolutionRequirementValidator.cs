using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteCropPhaseSolutionRequirementValidator : BaseValidator<DeleteCropPhaseSolutionRequirementCommand>
    {
        public DeleteCropPhaseSolutionRequirementValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteCropPhaseSolutionRequirementCommand command)
        {
            if (command.Id <= 0)
                return false;
            return true;
        }
    }
}