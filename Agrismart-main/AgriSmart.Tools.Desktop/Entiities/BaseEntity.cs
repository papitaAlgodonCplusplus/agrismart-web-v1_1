using System;
using System.ComponentModel;
using System.Runtime.CompilerServices;

namespace AgriSmart.Tools.Entities
{
    public class BaseEntity : IComparable<BaseEntity>, INotifyPropertyChanged
    {
        public int Id { get; set; }

        private string _Name;
        public string Name { get => _Name; set { _Name = value; OnPropertyChanged(); } }
        public int CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public int ModifiedBy { get; set; }
        public DateTime ModifiedDate { get;  set; }

        private bool _Active;
        public bool Active { get => _Active; set { _Active = value; OnPropertyChanged(); } }

        //to keep track of changes
        public bool IsNew { get; set; }
        public bool IsModified { get; set; }
        public bool IsDeleted { get; set; }

        public BaseEntity()
        {
            this.ModifiedDate = DateTime.Now;
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            BaseEntity otherpresentation = (BaseEntity)obj;
            if (!otherpresentation.Id.Equals(this.Id))
                return false;
            return true;
        }

        public override int GetHashCode()
        {
            return this.Id.GetHashCode();
        }

        public int CompareTo(BaseEntity other)
        {
            if (other != null)
            {
                return this.Id.CompareTo(other.Id);
            }
            return 1;
        }

        public event PropertyChangedEventHandler PropertyChanged;
        protected void OnPropertyChanged([CallerMemberName] string propertyName = null)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        public void AcceptChanges()
        {
            this.IsNew = false;
            this.IsModified = false;
            this.IsDeleted = false;
        }

    }
}
