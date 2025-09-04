using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllWatersValidator : BaseValidator<GetAllWatersQuery>
    {
        public GetAllWatersValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllWatersQuery query)
        {
            if (string.IsNullOrEmpty(query.CatalogId.ToString()))
                return false;

            return true;
        }
    }
}