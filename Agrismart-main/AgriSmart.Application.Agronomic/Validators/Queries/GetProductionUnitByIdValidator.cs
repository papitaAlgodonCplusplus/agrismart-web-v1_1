using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;

using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetProductionUnitByIdValidator : BaseValidator<GetProductionUnitByIdQuery>
    {
        public GetProductionUnitByIdValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetProductionUnitByIdQuery query)
        {
            if (string.IsNullOrEmpty(query.Id.ToString()))
                return false;

            return true;
        }
    }
}