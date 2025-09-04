using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Xml;

namespace AgriSmart.Tools.Entities
{
    public class SolutionFeatureInfo
    {
        public string Name { get; set; }
        public int Index { get; set; }
        public string FormatString { get; set; }
        public string Unit { get; set; }
        public bool Visible { get; set; }
        public string CategoryName { get; set; }
        public string MethodName { get; set; }
        public string FeatureName { get; set; }
        public Dictionary<string, string> Captions;
        public Dictionary<string, string> DisplayNames;
        public string Rule { get; set; }
        public string culture;

        public string Caption
        {
            get
            {
                return Captions[this.culture];
            }
        }

        public string DisplayName
        {
            get
            {
                return DisplayNames[this.culture];
            }
        }

        public SolutionFeatureInfo(XmlNode node, string culture)
        {
            this.culture = culture;

            Captions = new Dictionary<string, string>();
            DisplayNames = new Dictionary<string, string>();

            Name = node.Attributes["name"].Value;
            Index = Convert.ToInt32(node.Attributes["index"].Value);
            FormatString = node.Attributes["formatString"].Value;
            Visible = Convert.ToBoolean(node.Attributes["visible"].Value);
            CategoryName = node.Attributes["categoryName"].Value;
            MethodName = node.Attributes["methodName"].Value;
            FeatureName = node.Attributes["featureName"].Value;
            Unit = node.Attributes["unit"].Value;
            Rule = node.Attributes["rule"].Value;

            XmlNode captionsNode = node.ChildNodes[0];

            foreach (XmlNode caption in captionsNode.ChildNodes)
            {
                Captions.Add(caption.Name, caption.InnerText);
            }

            XmlNode displayNameNode = node.ChildNodes[1];

            foreach (XmlNode displayName in displayNameNode.ChildNodes)
            {
                DisplayNames.Add(displayName.Name, displayName.InnerText);
            }
        }
    }
}
