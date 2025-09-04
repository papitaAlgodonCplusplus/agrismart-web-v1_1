using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllIrrigationRequestsValidator : BaseValidator<GetAllIrrigationRequestsQuery>
    {
        public GetAllIrrigationRequestsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllIrrigationRequestsQuery query)
        {
            if (string.IsNullOrEmpty(query.FarmId.ToString()))
                return false;
            return true;
        }
    }
}