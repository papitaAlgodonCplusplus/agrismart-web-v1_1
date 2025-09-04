using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Services.Responses
{
    public class SaveResponse
    {
        public bool Success { get; set; } = true;
        public string Entity { get; set; }
        public string ExceptionMessage { get; set; }
    }
}
