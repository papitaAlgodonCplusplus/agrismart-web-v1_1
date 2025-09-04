using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetWaterByIdValidator : BaseValidator<GetWaterByIdQuery>
    {
        public GetWaterByIdValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetWaterByIdQuery query)
        {
            if (string.IsNullOrEmpty(query.Id.ToString()))
                return false;

            return true;
        }
    }
}