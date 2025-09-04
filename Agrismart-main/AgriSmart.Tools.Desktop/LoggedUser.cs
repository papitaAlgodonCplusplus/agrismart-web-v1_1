using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Entities;
using AgriSmart.Tools.Services;
using AgriSmart.Tools.Services.Responses;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Desktop
{
    public class LoggedUser
    {
        private IAgriSmartApiClient _agriSmartApiClient;

        private static LoggedUser uniqueInstance = null;
        public UserModel User { get; set; }
        public string ErroMessage { get; set; }
        private LoggedUser()
        {
        }

        public static LoggedUser getInstance()
        {
            if (uniqueInstance == null)
            {
                uniqueInstance = new LoggedUser();
            }

            return uniqueInstance;
        }
    }
}
