using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities.Base
{
    public class BaseCalculationEntity : IComparable<BaseCalculationEntity>
    {
        public Int64 Id { get; set; }
        public string Name { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime ModifiedDate { get; private set; }

        public BaseCalculationEntity()
        {
            this.ModifiedDate = DateTime.Now;
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            BaseCalculationEntity otherpresentation = (BaseCalculationEntity)obj;
            if (!otherpresentation.Id.Equals(this.Id))
                return false;
            return true;
        }

        public override int GetHashCode()
        {
            return this.Id.GetHashCode();
        }

        public int CompareTo(BaseCalculationEntity other)
        {
            if (other != null)
            {
                return this.Id.CompareTo(other.Id);
            }
            return 1;
        }
    }
}
