using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace AgriSmart.Tools.Entities
{
    public class SolutionFeatureCategoryInfo: IComparable<SolutionFeatureCategoryInfo>
    {
        public Dictionary<string, string> captions;
        public Dictionary<string, string> displayNames;
        public string culture;

        public string Name { get; set; }
        public int Index { get; set; }


        public string Caption
        {
            get
            {
                return captions[this.culture];
            }
        }

        public string DisplayName
        {
            get
            {
                return displayNames[this.culture];
            }
        }

        public SolutionFeatureCategoryInfo(string name)
        {
            Name = name;
        }

        public SolutionFeatureCategoryInfo(XmlNode node, string culture)
        {
            this.culture = culture;

            this.captions = new Dictionary<string, string>();
            this.displayNames = new Dictionary<string, string>();

            Name = node.Attributes["name"].Value;
            Index = Convert.ToInt32(node.Attributes["index"].Value);

            XmlNode captionsNode = node.ChildNodes[0];

            foreach (XmlNode caption in captionsNode.ChildNodes)
            {
                this.captions.Add(caption.Name, caption.InnerText);
            }

            //XmlNode displayNameNode = node.ChildNodes[1];

            //foreach (XmlNode displayName in displayNameNode.ChildNodes)
            //{
            //    this.displayNames.Add(displayName.Name, displayName.InnerText);
            //}
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            SolutionFeatureCategoryInfo otherWaterQualityFeatureCategoryInfo = (SolutionFeatureCategoryInfo)obj;
            if (!otherWaterQualityFeatureCategoryInfo.Name.Equals(this.Name))
                return false;
            return true;
        }

        public override int GetHashCode()
        {
            return this.Name.GetHashCode();
        }

        public int CompareTo(SolutionFeatureCategoryInfo other)
        {
            if (other != null)
            {
                return this.Name.CompareTo(other.Name);
            }
            return 1;
        }
    }
}
