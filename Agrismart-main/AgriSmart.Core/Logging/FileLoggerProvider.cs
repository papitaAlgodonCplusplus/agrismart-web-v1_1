using AgriSmart.Core.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace AgriSmart.Application.Logging
{
    public class FileLoggerProvider : ILoggerProvider
    {
        private string path;
        public FileLoggerProvider(IOptions<FileLoggingConfiguration> config)
        {
            path = config.Value.path;
        }
        public ILogger CreateLogger(string categoryName)
        {
            return new FileLogger(path);
        }

        public void Dispose()
        {
        }
    }
}
