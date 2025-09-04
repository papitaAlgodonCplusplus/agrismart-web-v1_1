using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.DataModels
{
    public class UserModel
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? UserName { get; set; }
        public int ProfileId { get; set; }
        public string? Token { get; set; }
        public DateTime ValidTo { get; set; }
        public bool Active { get; set; }
    }
}
