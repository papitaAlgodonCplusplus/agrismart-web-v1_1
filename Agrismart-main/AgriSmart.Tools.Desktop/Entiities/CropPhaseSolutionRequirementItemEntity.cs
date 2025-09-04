using System;

namespace AgriSmart.Tools.Entities
{
    public class CropPhaseSolutionRequirementItemEntity: IComparable<CropPhaseSolutionRequirementItemEntity>
    {
        public string RequirementName { get; set; }
        public double Value { get; set; }
        public CropPhaseSolutionRequirementItemEntity BaseSolutionFeature { get; set; }

        public CropPhaseSolutionRequirementItemEntity()
        {
        }

        public CropPhaseSolutionRequirementItemEntity(string featureName)
        {
            this.RequirementName = featureName;
        }


        public CropPhaseSolutionRequirementItemEntity(string featureName, double value)
        {
            this.RequirementName = featureName;
            this.Value = value;
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            CropPhaseSolutionRequirementItemEntity otherFeature = (CropPhaseSolutionRequirementItemEntity)obj;
            if (!otherFeature.RequirementName.Equals(this.RequirementName))
                return false;
            return true;
        }

        public override int GetHashCode()
        {
            return this.RequirementName.GetHashCode();
        }

        public int CompareTo(CropPhaseSolutionRequirementItemEntity other)
        {
            if (other != null)
            {
                return this.RequirementName.CompareTo(other.RequirementName);
            }
            return 1;
        }
    }
}
