using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllFertilizerChemistriesValidator : BaseValidator<GetAllFertilizerChemistriesQuery>
    {
        public GetAllFertilizerChemistriesValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllFertilizerChemistriesQuery query)
        {
            if (string.IsNullOrEmpty(query.FertilizerId.ToString()))
                return false;

            return true;
        }
    }
}