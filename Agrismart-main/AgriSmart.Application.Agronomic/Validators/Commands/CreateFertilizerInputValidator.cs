using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Core.Validators;
using FluentValidation;

namespace AgriSmart.Application.Agronomic.Validators.Commands
{
    public class CreateFertilizerInputValidator : BaseValidator<CreateFertilizerInputCommand>
    {
        public CreateFertilizerInputValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(CreateFertilizerInputCommand command)
        {
            if (string.IsNullOrEmpty(command.CatalogId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.InputPresentationId.ToString()))
                return false;
            if (string.IsNullOrEmpty(command.FertilizerId.ToString()))
                return false;
            if (command.Name == null || string.IsNullOrEmpty(command.Name?.ToString()))
                return false;
            return true;
        }
    }
}