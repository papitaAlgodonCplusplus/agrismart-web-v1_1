using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllDroppersValidator : BaseValidator<GetAllDroppersQuery>
    {
        public GetAllDroppersValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllDroppersQuery query)
        {
            if (string.IsNullOrEmpty(query.CatalogId.ToString()))
                return false;

            return true;
        }
    }
}