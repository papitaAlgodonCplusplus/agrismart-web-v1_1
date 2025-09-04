using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllInputPresentationsValidator : BaseValidator<GetAllInputPresentationsQuery>
    {
        public GetAllInputPresentationsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllInputPresentationsQuery query)
        {
            if (string.IsNullOrEmpty(query.CatalogId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.IncludeInactives.ToString()))
                return false;

            return true;
        }
    }
}