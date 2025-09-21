using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class DeleteCropValidator : BaseValidator<DeleteCropCommand>
    {
        public DeleteCropValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(DeleteCropCommand command)
        {
            if (command.Id <= 0)
                return false;
            return true;
        }
    }
}