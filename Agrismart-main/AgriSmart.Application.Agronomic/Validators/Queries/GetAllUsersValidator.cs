using FluentValidation;
using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Core.Validators;

namespace AgriSmart.Application.Agronomic.Validators.Queries
{
    public class GetAllUsersValidator : BaseValidator<GetAllUsersQuery>
    {
        public GetAllUsersValidator()
        {
            RuleFor(x => x).Must(AreFiltersValid).WithMessage(x => x.GetType().Name.ToString() + " parameters are invalid");
        }

        protected override bool AreFiltersValid(GetAllUsersQuery query)
        {
            if (string.IsNullOrEmpty(query.ProfileId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.ClientId.ToString()))
                return false;
            if (string.IsNullOrEmpty(query.UserStatusId.ToString()))
                return false;
            return true;
        }
    }
}