using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllUserFarmsValidator : BaseValidator<GetAllUserFarmsQuery>
    {
        public GetAllUserFarmsValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllUserFarmsQuery query)
        {
            if (string.IsNullOrEmpty(query.UserId.ToString()))
                return false;            
            return true;
        }
    }
}