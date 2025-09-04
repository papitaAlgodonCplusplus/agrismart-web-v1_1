using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace AgriSmart.Tools.Entities
{
    public class SolutionFeatureCategory : IComparable<SolutionFeatureCategory>
    {
        public Dictionary<string, string> captions;
        public Dictionary<string, string> displayNames;
        public string culture;

        public string Name { get; set; }
        public string Caption { get; set; }
        public int Index { get; set; }


        public SolutionFeatureCategory(string name)
        {
            Name = name;
        }

        public SolutionFeatureCategory(SolutionFeatureCategoryInfo featureCategoryInfo)
        {
            Name = featureCategoryInfo.Name;
            Caption = featureCategoryInfo.Caption;
            Index = featureCategoryInfo.Index;
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            SolutionFeatureCategory otherWaterQualityFeatureCategoryInfo = (SolutionFeatureCategory)obj;
            if (!otherWaterQualityFeatureCategoryInfo.Name.Equals(this.Name))
                return false;
            return true;
        }

        public override int GetHashCode()
        {
            return this.Name.GetHashCode();
        }

        public int CompareTo(SolutionFeatureCategory other)
        {
            if (other != null)
            {
                return this.Name.CompareTo(other.Name);
            }
            return 1;
        }
    }
}
