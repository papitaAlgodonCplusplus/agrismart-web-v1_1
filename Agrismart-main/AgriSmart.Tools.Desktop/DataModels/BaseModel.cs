using System;

namespace AgriSmart.Tools.DataModels
{
    public class BaseModel
    {
        public int Id { get; set; } 
        public string Name { get; set; }
        public int CreatedBy { get; set; }
        public DateTime DateCreated { get; set; }
        public int UpdateBy { get; set; }
        public DateTime DateUpdated { get; private set; }
        public bool Active { get; set; }

    }
}
