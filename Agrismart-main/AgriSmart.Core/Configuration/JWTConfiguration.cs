namespace AgriSmart.Core.Configuration
{
    public class JWTConfiguration
    {
        public string ValidAudience { get; set; } = string.Empty;
        public string ValidIssuer { get; set; } = string.Empty;
        public string Secret { get; set; } = string.Empty;
    }
}
