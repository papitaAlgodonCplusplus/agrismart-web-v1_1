using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetFertilizerChemistryByIdValidator : BaseValidator<GetFertilizerChemistryByIdQuery>
    {
        public GetFertilizerChemistryByIdValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetFertilizerChemistryByIdQuery query)
        {
            if (string.IsNullOrEmpty(query.Id.ToString()))
                return false;

            return true;
        }
    }
}