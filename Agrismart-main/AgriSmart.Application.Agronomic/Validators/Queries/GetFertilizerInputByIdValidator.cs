using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetFertilizerInputByIdValidator : BaseValidator<GetFertilizerInputByIdQuery>
    {
        public GetFertilizerInputByIdValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetFertilizerInputByIdQuery query)
        {
            if (string.IsNullOrEmpty(query.Id.ToString()))
                return false;

            return true;
        }
    }
}