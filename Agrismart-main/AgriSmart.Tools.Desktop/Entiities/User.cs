using System;

namespace AgriSmart.Tools.Entities
{
    public class User
    {
        public int Id { get; set; }
        public int clientId { get; set; }
        public string UserName { get; set; }
        public int ProfileId { get; set; }
        public string Token { get; set; }
        public DateTime ValidTo { get; set; }
        public bool Active { get; set; }
    }
}
