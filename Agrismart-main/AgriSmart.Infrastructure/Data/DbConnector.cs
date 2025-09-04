using AgriSmart.Core.Configuration;
using Microsoft.Extensions.Options;
using System.Data;
using Microsoft.Data.SqlClient;

namespace AgriSmart.Infrastructure.Data
{
    public class DbConnector
    {
        private readonly AgriSmartDbConfiguration _agriSmartDbConfiguration;

        protected DbConnector(IOptions<AgriSmartDbConfiguration> agriSmartDbConfiguration)
        {
            _agriSmartDbConfiguration = agriSmartDbConfiguration.Value;
        }

        public IDbConnection CreateConnection()
        {
            return new SqlConnection(_agriSmartDbConfiguration.ConnectionString);
        }
    }
}
