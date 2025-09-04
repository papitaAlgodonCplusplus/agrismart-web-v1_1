using System;
using System.Collections.Generic;
using System.Xml;

namespace AgriSmart.Tools.Entities
{
    public class BalanceItemInfo
    {
        public string Uid { get; set; }
        public string Symbol { get; set; }
        public string SupplyProperty { get; set; }

        protected Dictionary<string, string> symbolDisplayNames;
        protected Dictionary<string, string> displayNames;
        protected Dictionary<string, string> reqTitles;
        protected Dictionary<string, string> supTitles;

        protected string culture;

        public string DisplayName
        {
            get
            {
                return displayNames[this.culture];
            }
        }

        public string SymbolDisplayName
        {
            get
            {
                return symbolDisplayNames[this.culture];
            }
        }

        public string ReqTitle
        {
            get
            {
                return reqTitles[this.culture];
            }
        }

        public string SupTitle
        {
            get
            {
                return supTitles[this.culture];
            }
        }


        public BalanceItemInfo(XmlNode node, string culture)
        {
            this.culture = culture;

            //create a new displayNames dictionary
            this.symbolDisplayNames = new Dictionary<string, string>();
            this.displayNames = new Dictionary<string, string>();
            this.reqTitles = new Dictionary<string, string>();
            this.supTitles = new Dictionary<string, string>();

            Uid = node.Attributes["uid"].Value;
            SupplyProperty = node.Attributes["supplyProp"].Value;

            XmlNode symbolDisplayNameNode = node.ChildNodes[0];

            foreach (XmlNode symbolDisplayName in symbolDisplayNameNode.ChildNodes)
            {
                this.symbolDisplayNames.Add(symbolDisplayName.Name, symbolDisplayName.InnerText);
            }

            XmlNode displayNameNode = node.ChildNodes[1];

            foreach (XmlNode displayName in displayNameNode.ChildNodes)
            {
                this.displayNames.Add(displayName.Name, displayName.InnerText);
            }

            XmlNode reqTitleNode = node.ChildNodes[2];

            foreach (XmlNode reqTitle in reqTitleNode.ChildNodes)
            {
                this.reqTitles.Add(reqTitle.Name, reqTitle.InnerText);
            }

            XmlNode supTitleNode = node.ChildNodes[3];

            foreach (XmlNode supTitle in supTitleNode.ChildNodes)
            {
                this.supTitles.Add(supTitle.Name, supTitle.InnerText);
            }
        }

        public override bool Equals(object obj)
        {
            if (obj == null) return false;
            if (this.GetType() != obj.GetType()) return false;
            BalanceItemInfo otherItem = (BalanceItemInfo)obj;
            if (!otherItem.Uid.Equals(this.Uid))
                return false;
            return true;
        }

        public override int GetHashCode()
        {
            return this.Uid.GetHashCode();
        }

    }
}
