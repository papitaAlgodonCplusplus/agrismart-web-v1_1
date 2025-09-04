using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllDevicesValidator : BaseValidator<GetAllDevicesQuery>
    {
        public GetAllDevicesValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllDevicesQuery query)
        {
            if (string.IsNullOrEmpty(query.ClientId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.CompanyId.ToString()))
                return false;

            return true;
        }
    }
}