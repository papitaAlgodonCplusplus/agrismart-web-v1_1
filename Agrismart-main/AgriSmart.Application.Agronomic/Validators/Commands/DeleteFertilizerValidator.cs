using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteFertilizerValidator : BaseValidator<DeleteFertilizerCommand>
    {
        public DeleteFertilizerValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteFertilizerCommand command)
        {
            if (command.Id <= 0)
                return false;
            return true;
        }
    }
}